#!/usr/bin/env python3
"""Curate the X-list digest in Readwise Reader down to a daily shortlist.

Readwise ingests the public X List as ONE digest document per AM/PM edition
(category=rss, ~100+ embedded tweets). This job:

  1. finds unprocessed digest docs in the Feed
  2. parses them into individual tweet entries (incl. retweets/quote-tweets
     by list members — amplification by a curated account is a signal)
  3. prefilters: only threads, link-tweets, and long posts compete
  4. Gemini scores each against prompt.md
  5. keepers get saved individually via POST /save/ with the tweet URL —
     Readwise renders them cleanly and auto-unrolls threads — tagged into
     the Shortlist view; link-tweets with no commentary save the article URL
  6. the digest doc itself is archived

State (processed digests + saved tweets) lives in data/seen.json.

Usage:
  python curate.py             # real run
  python curate.py --dry-run   # no writes to Readwise
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path

import yaml

HERE = Path(__file__).parent
READER_API = "https://readwise.io/api/v3"
STATE_PATH = HERE / "data" / "seen.json"

TWEET_DOMAINS = ("twitter.com", "x.com", "t.co", "pbs.twimg.com", "readwise.io", "video.twimg.com")
STATUS_RE = re.compile(r"https?://(?:twitter|x)\.com/([A-Za-z0-9_]+)/status/(\d+)")
THREAD_HINT_RE = re.compile(r"🧵|\b1/\d{0,2}\b|\(thread\)|^thread\b", re.I | re.M)


# ---------- HTTP ----------

def http(method, url, token=None, body=None, retries=3):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Token {token}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                raw = r.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries - 1:
                wait = int(e.headers.get("Retry-After", 30))
                print(f"  rate limited, sleeping {wait}s")
                time.sleep(wait)
                continue
            raise


# ---------- digest parsing ----------

class DigestParser(HTMLParser):
    """Extract individual tweet entries from a Readwise X-list digest doc.

    Top-level <article class="rw-embedded-tweet"> = one entry; a nested
    article inside it is a quoted tweet (its text counts toward the entry).
    """

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.entries = []
        self.depth = 0          # article nesting depth
        self.in_header = 0      # inside <header> (author name/handle chrome)
        self.cur = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "header":
            self.in_header += 1
        if tag == "article" and "rw-embedded-tweet" in (a.get("class") or ""):
            self.depth += 1
            if self.depth == 1:
                self.cur = {
                    "tweet_id": a.get("data-rw-tweet-id"),
                    "text": [], "quoted_text": [],
                    "handles": [], "links": [],
                    "retweeted_by": None, "quoted_id": None, "quoted_handle": None,
                }
            elif self.depth == 2 and self.cur is not None:
                self.cur["quoted_id"] = a.get("data-rw-tweet-id")
        elif tag == "a" and self.cur is not None:
            href = a.get("href", "")
            m = STATUS_RE.match(href)
            if m:
                if self.depth == 2 and not self.cur["quoted_handle"]:
                    self.cur["quoted_handle"] = m.group(1)
            elif re.match(r"https?://(?:twitter|x)\.com/([A-Za-z0-9_]+)/?$", href):
                self.cur["handles"].append((self.depth, href.rstrip("/").rsplit("/", 1)[-1]))
            elif href.startswith("http") and not any(d in href for d in TWEET_DOMAINS):
                self.cur["links"].append(href)

    def handle_endtag(self, tag):
        if tag == "header" and self.in_header > 0:
            self.in_header -= 1
        if tag == "article" and self.depth > 0:
            if self.depth == 1 and self.cur is not None:
                self.entries.append(self._finish(self.cur))
                self.cur = None
            self.depth -= 1

    def handle_data(self, data):
        if self.cur is None or self.in_header or not data.strip():
            return
        t = data.strip()
        if "retweeted" in t and t.startswith("@") and self.cur["retweeted_by"] is None:
            self.cur["retweeted_by"] = t.split()[0].lstrip("@")
            return
        (self.cur["text"] if self.depth == 1 else self.cur["quoted_text"]).append(t)

    def _finish(self, e):
        own = " ".join(e["text"])
        quoted = " ".join(e["quoted_text"])
        # author = first profile handle seen at depth 1 that isn't the retweeter
        author = next((h for d, h in e["handles"] if d == 1 and h != e["retweeted_by"]), None)
        return {
            "tweet_id": e["tweet_id"],
            "author": author,
            "retweeted_by": e["retweeted_by"],
            "text": own,
            "quoted_author": e["quoted_handle"],
            "quoted_id": e["quoted_id"],
            "quoted_text": quoted,
            "links": list(dict.fromkeys(e["links"])),
            "words": len(own.split()) + len(quoted.split()),
        }


def parse_digest(html):
    p = DigestParser()
    p.feed(html)
    return [e for e in p.entries if e["tweet_id"] and e["author"]]


def classify(entry, min_words):
    """thread | link | long | short — only short is dropped unscored."""
    if THREAD_HINT_RE.search(entry["text"]):
        return "thread"
    if entry["links"]:
        return "link"
    if entry["words"] >= min_words:
        return "long"
    return "short"


# ---------- scoring ----------

def score_with_gemini(candidates, cfg):
    prompt = (HERE / "prompt.md").read_text()
    items_payload = [
        {
            "id": c["tweet_id"],
            "author": c["author"],
            "shared_by_list_member": c["retweeted_by"],
            "kind": c["kind"],
            "text": c["text"][:4000],
            "quoted_author": c["quoted_author"],
            "quoted_text": c["quoted_text"][:2000],
            "external_links": c["links"][:3],
        }
        for c in candidates
    ]
    schema = {
        "type": "ARRAY",
        "items": {
            "type": "OBJECT",
            "properties": {
                "id": {"type": "STRING"},
                "score": {"type": "NUMBER"},
                "why": {"type": "STRING"},
                "topic": {"type": "STRING", "enum": cfg["topics"]},
            },
            "required": ["id", "score", "why", "topic"],
        },
    }
    body = {
        "contents": [{
            "parts": [{
                "text": prompt
                + "\n\n## Allowed topic tags\n" + ", ".join(cfg["topics"])
                + "\n\n## Items to score (JSON)\n" + json.dumps(items_payload, ensure_ascii=False)
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
            "temperature": 0.1,
            "thinkingConfig": {"thinkingLevel": cfg.get("thinking_level", "high")},
        },
    }
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{cfg['model']}:generateContent?key={os.environ['GEMINI_API_KEY']}"
    )
    resp = http("POST", url, body=body)
    text = resp["candidates"][0]["content"]["parts"][0]["text"]
    return {s["id"]: s for s in json.loads(text)}


# ---------- readwise actions ----------

def save_target(entry):
    """What URL to save for a keeper: the article itself when the tweet is
    just a pointer; otherwise the tweet (threads auto-unroll on save)."""
    clean_links = [l for l in entry["links"] if not l.startswith("https://t.co")]
    if entry["kind"] == "link" and entry["words"] < 60 and len(clean_links) == 1:
        return clean_links[0]
    return f"https://twitter.com/{entry['author']}/status/{entry['tweet_id']}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    cfg = yaml.safe_load((HERE / "config.yaml").read_text())
    token = os.environ["READWISE_TOKEN"]

    state = {"processed_digests": [], "saved_tweets": [], "last_run": None}
    if STATE_PATH.exists():
        state.update(json.loads(STATE_PATH.read_text()))

    # 1. find unprocessed digest docs
    since = (datetime.now(timezone.utc) - timedelta(hours=cfg["lookback_hours"])).strftime("%Y-%m-%dT%H:%M:%SZ")
    params = {"location": "feed", "category": "rss", "updatedAfter": since,
              "withHtmlContent": "true", "limit": "50"}
    docs = http("GET", f"{READER_API}/list/?{urllib.parse.urlencode(params)}", token=token).get("results", [])
    digests = [d for d in docs
               if cfg["list_url_match"] in (d.get("source_url") or "")
               and d["id"] not in state["processed_digests"]]
    print(f"{len(digests)} unprocessed digest(s)")
    if not digests:
        return

    # 2. parse + dedupe entries
    entries, seen_ids = [], set(state["saved_tweets"])
    for d in digests:
        parsed = parse_digest(d.get("html_content") or "")
        print(f"  {d['title']}: {len(parsed)} entries")
        entries += parsed
    uniq = {}
    for e in entries:
        if e["tweet_id"] not in seen_ids:
            uniq.setdefault(e["tweet_id"], e)
    entries = list(uniq.values())

    # 3. prefilter
    for e in entries:
        e["kind"] = classify(e, cfg["min_word_count"])
    from collections import Counter
    print(dict(Counter(e["kind"] for e in entries)))
    candidates = [e for e in entries if e["kind"] != "short"]

    # 4. score
    keepers, scored = [], {}
    if candidates:
        scored = score_with_gemini(candidates, cfg)
        ranked = sorted((c for c in candidates if c["tweet_id"] in scored),
                        key=lambda c: -scored[c["tweet_id"]]["score"])
        keepers = [c for c in ranked if scored[c["tweet_id"]]["score"] >= cfg["min_score"]][: cfg["keep_count"]]

    print(f"\n=== KEEPERS ({len(keepers)}) ===")
    for k in keepers:
        s = scored[k["tweet_id"]]
        via = f" (via @{k['retweeted_by']})" if k["retweeted_by"] else ""
        print(f"  [{s['score']:.0f}] {s['topic']:20} @{k['author']}{via}: {k['text'][:70]}")
        print(f"        -> {save_target(k)}")
        print(f"        {s['why']}")

    if args.dry_run:
        print("\n(dry run — no writes)")
        return

    # 5. save keepers as individual clean docs
    for k in keepers:
        s = scored[k["tweet_id"]]
        http("POST", f"{READER_API}/save/", token=token, body={
            "url": save_target(k),
            "location": "new",
            "tags": cfg["keeper_tags"] + [s["topic"]],
            "saved_using": "twitter-curation",
        })
        state["saved_tweets"].append(k["tweet_id"])
        time.sleep(1.3)  # save: 50 req/min

    # 6. archive the digests themselves
    if cfg["archive_digest"]:
        for d in digests:
            http("PATCH", f"{READER_API}/update/{d['id']}/", token=token, body={"location": "archive"})
            time.sleep(3.5)  # update via list-bucket caution

    state["processed_digests"] = (state["processed_digests"] + [d["id"] for d in digests])[-200:]
    state["saved_tweets"] = state["saved_tweets"][-5000:]
    state["last_run"] = datetime.now(timezone.utc).isoformat()
    STATE_PATH.parent.mkdir(exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, indent=1))
    print("done")


if __name__ == "__main__":
    sys.exit(main())

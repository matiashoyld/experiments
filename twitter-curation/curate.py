#!/usr/bin/env python3
"""Curate the X-list firehose in Readwise Reader down to a daily shortlist.

Flow: fetch new Feed tweets -> prefilter (threads / link-tweets / long posts
only) -> Gemini scores against prompt.md -> top N tagged into Shortlist,
rest archived. State (seen IDs) lives in data/seen.json.

Usage:
  python curate.py             # real run
  python curate.py --dry-run   # no writes to Readwise
  python curate.py --limit 20  # cap items scored (testing)
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
from pathlib import Path

import yaml

HERE = Path(__file__).parent
READER_API = "https://readwise.io/api/v3"
STATE_PATH = HERE / "data" / "seen.json"

EXTERNAL_LINK_RE = re.compile(r'href="https?://(?!(?:x\.com|twitter\.com|t\.co|pbs\.twimg\.com|read\.readwise\.io))', re.I)
THREAD_MARKER = "rw_tt_thread=True"


def http(method, url, token=None, body=None, retries=3):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Token {token}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read() or "{}")
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries - 1:
                wait = int(e.headers.get("Retry-After", 30))
                print(f"  rate limited, sleeping {wait}s")
                time.sleep(wait)
                continue
            raise


def load_state():
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"seen_ids": [], "last_run": None}


def save_state(state):
    STATE_PATH.parent.mkdir(exist_ok=True)
    # keep the seen set bounded
    state["seen_ids"] = state["seen_ids"][-5000:]
    STATE_PATH.write_text(json.dumps(state, indent=1))


def fetch_new_tweets(token, since_iso):
    """All Feed tweets updated since `since_iso`, with html content."""
    items, cursor = [], None
    while True:
        params = {
            "location": "feed",
            "category": "tweet",
            "updatedAfter": since_iso,
            "withHtmlContent": "true",
            "limit": "100",
        }
        if cursor:
            params["pageCursor"] = cursor
        url = f"{READER_API}/list/?{urllib.parse.urlencode(params)}"
        page = http("GET", url, token=token)
        items += page.get("results", [])
        cursor = page.get("nextPageCursor")
        if not cursor:
            break
        time.sleep(3.5)  # list endpoint: 20 req/min
    return items


def classify(item, min_words):
    """thread | link | long | short — only 'short' is dropped unscored."""
    src = item.get("source_url") or ""
    html = item.get("html_content") or ""
    words = item.get("word_count") or 0
    if THREAD_MARKER in src:
        return "thread"
    if EXTERNAL_LINK_RE.search(html):
        return "link"
    if words >= min_words:
        return "long"
    return "short"


def score_with_gemini(candidates, cfg):
    prompt = (HERE / "prompt.md").read_text()
    items_payload = [
        {
            "id": c["id"],
            "author": c.get("author"),
            "kind": c["kind"],
            "word_count": c.get("word_count"),
            "title": c.get("title"),
            "summary": c.get("summary"),
            "text": re.sub(r"<[^>]+>", " ", c.get("html_content") or "")[:4000],
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
        },
    }
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{cfg['model']}:generateContent?key={os.environ['GEMINI_API_KEY']}"
    )
    resp = http("POST", url, body=body)
    text = resp["candidates"][0]["content"]["parts"][0]["text"]
    return {s["id"]: s for s in json.loads(text)}


def update_doc(token, doc_id, location=None, tags=None):
    body = {}
    if location:
        body["location"] = location
    if tags is not None:
        body["tags"] = tags
    return http("PATCH", f"{READER_API}/update/{doc_id}/", token=token, body=body)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    cfg = yaml.safe_load((HERE / "config.yaml").read_text())
    token = os.environ["READWISE_TOKEN"]
    state = load_state()
    seen = set(state["seen_ids"])

    since = (datetime.now(timezone.utc) - timedelta(hours=cfg["lookback_hours"])).strftime("%Y-%m-%dT%H:%M:%SZ")
    items = [i for i in fetch_new_tweets(token, since) if i["id"] not in seen]
    if args.limit:
        items = items[: args.limit]
    print(f"{len(items)} new feed tweets since {since}")
    if not items:
        return

    buckets = {"thread": [], "link": [], "long": [], "short": []}
    for it in items:
        kind = classify(it, cfg["min_word_count"])
        it["kind"] = kind
        buckets[kind].append(it)
    print({k: len(v) for k, v in buckets.items()})

    candidates = buckets["thread"] + buckets["link"] + buckets["long"]
    keepers, scored = [], {}
    if candidates:
        scored = score_with_gemini(candidates, cfg)
        ranked = sorted(
            (c for c in candidates if c["id"] in scored),
            key=lambda c: -scored[c["id"]]["score"],
        )
        keepers = [c for c in ranked if scored[c["id"]]["score"] >= cfg["min_score"]][: cfg["keep_count"]]

    keeper_ids = {k["id"] for k in keepers}
    print(f"\n=== KEEPERS ({len(keepers)}) ===")
    for k in keepers:
        s = scored[k["id"]]
        print(f"  [{s['score']:.0f}] {s['topic']:20} @{k.get('author')}: {k.get('title', '')[:60]}")
        print(f"        {s['why']}")

    if args.dry_run:
        print("\n(dry run — no writes)")
        return

    for k in keepers:
        s = scored[k["id"]]
        update_doc(token, k["id"], location="new", tags=cfg["keeper_tags"] + [s["topic"]])
        time.sleep(1.3)  # update: 50 req/min

    if cfg["archive_nonkeepers"]:
        to_archive = [i for i in items if i["id"] not in keeper_ids]
        print(f"archiving {len(to_archive)} non-keepers")
        for i in to_archive:
            update_doc(token, i["id"], location="archive")
            time.sleep(1.3)

    state["seen_ids"] += [i["id"] for i in items]
    state["last_run"] = datetime.now(timezone.utc).isoformat()
    save_state(state)
    print("done")


if __name__ == "__main__":
    sys.exit(main())

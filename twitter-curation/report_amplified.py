#!/usr/bin/env python3
"""Rank non-list accounts that your list members keep amplifying (RT/QT).

These are organic candidates for expanding the Signal list — the strongest
signal is an account amplified by MANY DISTINCT list members. Run this every
month or two:

    python report_amplified.py                 # markdown table to stdout
    python report_amplified.py --min-members 2 # only accounts ≥2 distinct amplifiers
    python report_amplified.py --since 2026-07 # only events on/after a date prefix
"""

import argparse
import json
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).parent
LEDGER = HERE / "data" / "amplified.jsonl"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-members", type=int, default=1, help="min distinct list members who amplified")
    ap.add_argument("--since", default="", help="only events with date >= this prefix (e.g. 2026-07)")
    ap.add_argument("--top", type=int, default=50)
    args = ap.parse_args()

    if not LEDGER.exists():
        print("No ledger yet — run curate.py a few times first.")
        return

    members = {h.lower() for h in (HERE / "list-members.txt").read_text().split()}

    # dedupe events by tweet_id (a digest is processed once, but be safe)
    events = {}
    for line in LEDGER.read_text().splitlines():
        if not line.strip():
            continue
        e = json.loads(line)
        if args.since and (e.get("date") or "") < args.since:
            continue
        if (e.get("amplified") or "").lower() in members:
            continue  # got added to the list since
        events[e["tweet_id"]] = e

    agg = defaultdict(lambda: {"n": 0, "via": set(), "dates": set(), "scores": [], "samples": []})
    for e in events.values():
        a = agg[e["amplified"]]
        a["n"] += 1
        a["via"].add(e["via"])
        if e.get("date"):
            a["dates"].add(e["date"])
        if e.get("score") is not None:
            a["scores"].append(e["score"])
        a["samples"].append((e.get("score") or 0, e["relation"], e["via"], e.get("text", "")))

    ranked = sorted(
        ((h, d) for h, d in agg.items() if len(d["via"]) >= args.min_members),
        key=lambda kv: (len(kv[1]["via"]), kv[1]["n"], max(kv[1]["scores"] or [0])),
        reverse=True,
    )[: args.top]

    total = len(events)
    print(f"# Amplified accounts — list-expansion candidates\n")
    print(f"{total} amplification events across the ledger; "
          f"{len(agg)} distinct non-list accounts; showing {len(ranked)} with ≥{args.min_members} distinct amplifier(s).\n")
    print("Ranked by # of DISTINCT list members who amplified them (independent endorsements = strongest signal).\n")
    print("| Account | Amplifiers | Times | Best score | Amplified by | Sample |")
    print("|---|---|---|---|---|---|")
    for h, d in ranked:
        best = max(d["scores"]) if d["scores"] else "—"
        via = ", ".join(f"@{v}" for v in sorted(d["via"])[:5]) + ("…" if len(d["via"]) > 5 else "")
        sample = max(d["samples"])[3].replace("\n", " ")[:80]
        print(f"| **@{h}** | {len(d['via'])} | {d['n']} | {best} | {via} | {sample} |")


if __name__ == "__main__":
    main()

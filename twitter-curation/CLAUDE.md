# twitter-curation

Daily curation of an X/Twitter list into Readwise Reader's Shortlist. Readwise natively
ingests the public X List ["Signal"](https://x.com/i/lists/2063490581108830659) (98
accounts) into the Reader Feed; this job scores each new item against Matias's taste and
keeps only the best 5–10 per day.

**Pipeline**: Reader Feed (`location=feed`, `category=tweet`) → prefilter (only unrolled
threads, link-tweets, and long posts ≥100 words; short standalone posts auto-archive) →
Gemini scores 0–10 via `prompt.md` → top `keep_count` get tags `shortlist`+`curated`+topic
and move to Inbox → rest archived. Seen-IDs state in `data/seen.json` (committed back by CI).

## Stack & files

- Python 3.12, stdlib + PyYAML. Gemini via REST (no SDK).
- `curate.py` — the job. `config.yaml` — knobs (keep count, word threshold, topics, model).
  `prompt.md` — the taste prompt (calibrated 2026-06-06; tune here, not in code).
- `.github/workflows/curate.yml` — cron 2×/day (after Reader's AM/PM digests) + manual dispatch.

## Run locally

```bash
set -a; source .env; set +a       # READWISE_TOKEN, GEMINI_API_KEY (gitignored)
python3 curate.py --dry-run       # no writes
python3 curate.py                 # real run
```

CI secrets `READWISE_TOKEN` + `GEMINI_API_KEY` are set on the repo.

## Notes

- IMPORTANT: only touches `category=tweet` in the Feed — Matias's newsletter feeds
  (category=email) share the same Feed location and must never be archived by this job.
- Reader API: list/bulk = 20 req/min, update = 50 req/min; `withHtmlContent=true` for body.
- `data-saved-tweets.json` (gitignored) = his 116 manually saved tweets; taste calibration data.
- Full project context lives in the brain: `~/brain/personal/01_projects/05_twitter_curation/`.

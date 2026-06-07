# twitter-curation

Daily curation of an X/Twitter list into Readwise Reader's Shortlist. Readwise natively
ingests the public X List ["Signal"](https://x.com/i/lists/2063490581108830659) (98
accounts) into the Reader Feed; this job scores each new item against Matias's taste and
keeps only the best 5–10 per day.

**Pipeline**: Readwise delivers the list as ONE digest doc per AM/PM edition
(`category=rss`, ~80-120 embedded tweets). The job parses the digest into entries
(incl. RTs/quote-tweets by members — amplification is signal) → prefilter (threads,
link-tweets, long posts ≥100 words; short posts dropped) → Gemini scores 0–10 via
`prompt.md` → top `keep_count` (score floor `min_score`, max `source_cap` per
author/RTer) saved **individually** via `POST /save/`, tagged `shortlist`+`curated`+topic
into `keeper_location` → digest doc archived. State in `data/seen.json` (committed by CI).

**What gets saved (`value_in`)**: the LLM judges per item whether the value is in the
tweet/thread itself (`value_in: content` → save the tweet, threads auto-unroll) or in a
linked article (`value_in: link` → save that URL so Readwise fetches it as a clean
article). Handles the "great RT/QT of someone's link" case — the article lands, not the stub.

**Amplification ledger**: every run appends to `data/amplified.jsonl` the non-list accounts
that list members RT'd/quote-tweeted (amplified handle, which member, relation, score).
`python report_amplified.py` ranks them by # of distinct amplifiers — the organic
candidate pool for expanding the list. Run it every month or two.

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

- IMPORTANT: only touches docs whose `source_url` matches `list_url_match` (the Signal
  list digest) — Matias's newsletter/RSS feeds share the Feed location and must never
  be archived by this job.
- Saving a tweet URL auto-unrolls threads (verified: 1-tweet save → 2,510-word doc).
  Re-saving the same URL dedupes to the same doc (safe).
- Reader API: list/bulk = 20 req/min, save/update = 50 req/min; `withHtmlContent=true` for body.
- `data-saved-tweets.json` (gitignored) = his 116 manually saved tweets; taste calibration data.
- Full project context lives in the brain: `~/brain/personal/01_projects/05_twitter_curation/`.

# wonder-weeks-codex

A standalone Wonder Weeks-inspired app prototype built from public information only.

## What changed

The project is now an actual in-app prototype instead of a landing page.

It includes:
- persistent baby profile with due date and view date
- tab navigation for Today, Timeline, Leap, Diary, and More
- an interactive leap chart driven by public Wonder Weeks anchor weeks
- a focused leap detail screen
- a local-only diary stored in browser storage

## Accuracy boundary

Publicly verified:
- 10 leaps in the first 20 months
- due-date based timing
- fussy phase, skills phase, and easy spell as public concepts
- partner sync, diary, forum/community, videos, polls, and baby monitor as public features
- leap names and public anchor weeks

Inferred in this prototype:
- exact current phase for a given day
- exact easy-spell timing between leaps
- any screen content that would require access to private or paid app content

## Run locally

From this folder:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Sources

- App Store listing
- Google Play listing
- Official Wonder Weeks app page
- Official leap chart
- Official FAQs for due dates, chart symbols, partner sharing, and baby monitor

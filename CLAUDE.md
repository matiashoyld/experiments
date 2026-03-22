# Experiments

Personal playground for spinning up quick experiments and small projects.

## Conventions

### Starting a new experiment

1. Create a folder at the root: `my-project-name/` (kebab-case)
2. Add a `CLAUDE.md` inside it describing what it is and how to work on it
3. Work directly on `main` branch — no feature branches needed for this repo

### Tech stack defaults

| Type | Default | When to use |
|------|---------|-------------|
| Small web project | Vanilla HTML/CSS/JS (single `index.html`) | Landing pages, interactive tools, one-off sites |
| Larger web app | Next.js + shadcn/ui | Anything needing routing, state, or a real UI framework |
| Data / analytics | Python (pandas, matplotlib, numpy) | Charts, data analysis, scraping |
| Deployment | Vercel | Any web project that needs to be live |

### Folder structure

Each experiment is a self-contained folder at the root. No shared code between projects.

```
experiments/
  .gitignore          # root gitignore (shared)
  CLAUDE.md           # this file
  my-project/
    CLAUDE.md         # project-specific context
    index.html        # or whatever the entry point is
    ...
```

### What goes in a subproject CLAUDE.md

Keep it short. Include:
- What the project is (1-2 sentences)
- Tech stack used
- How to run/preview locally (if applicable)
- Any API keys or env vars needed
- Deployment info (if deployed)

### Git

- Single `main` branch. Commit directly.
- Don't track large binary files (mp3, mp4, pptx). They're in `.gitignore`.
- Generated output (PDFs, PNGs from scripts) can be tracked if small and useful.

### Visual testing

Use `agent-browser` CLI (globally installed) to preview and screenshot web projects:
```bash
agent-browser open "file:///Users/matiashoyl/Proyectos/experiments/my-project/index.html"
agent-browser screenshot /tmp/screenshot.png          # viewport only
agent-browser screenshot --full /tmp/screenshot.png   # full page
agent-browser screenshot --annotate /tmp/screenshot.png  # numbered interactive elements
```

### Deployment

Web projects use Vercel. To deploy a new project:
```bash
cd my-project/
npx vercel
```

For static HTML projects, no config needed — Vercel auto-detects them.

## Current projects

| Folder | What it is | Tech | URL |
|--------|-----------|------|-----|
| `april-roadtrip/` | RV road trip planning (Yosemite, Sequoia) | Markdown | — |
| `inaki-birthday/` | Star Wars themed birthday invitation site | HTML/CSS/JS, Google Apps Script | https://inaki-birthday.vercel.app |
| `openclaw/` | Legal clause analysis app | Next.js | — |
| `pokemon-phonics/` | Pokemon-themed phonics learning game for kids | Next.js, Gemini TTS | https://pokemon-phonics.vercel.app |
| `usa-trip/` | Family trip comparison tool (Seattle vs Yellowstone vs Banff) | HTML/CSS/JS | https://usa-trip.vercel.app |
| `voter-chart-chile/` | Chile voter demographics analysis chart | Python (pandas, matplotlib) | — |
| `wonder-weeks/` | Baby development tracker | Next.js | https://wonder-weeks.vercel.app |

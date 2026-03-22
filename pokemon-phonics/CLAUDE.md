# Pokemon Phonics

A Pokemon-themed phonics learning game for a 5-year-old, teaching reading through Systematic Synthetic Phonics (SSP) with Pokemon collection, evolution, and battle mechanics as the engagement layer.

## Tech Stack

- **Framework:** Next.js (App Router)
- **UI:** React + custom Pokemon-themed CSS (no component library)
- **TTS:** Google Gemini 2.5 Flash Preview TTS (pre-generated, cached)
- **Pokemon Sprites:** PokeAPI (free, no key needed)
- **Phoneme Audio:** Recorded by parent via admin panel (MediaRecorder API)
- **Storage:** localStorage (game progress), public/audio/ (cached audio files)
- **Deployment:** Vercel

## Deployment

- **Production URL:** https://pokemon-phonics.vercel.app
- **Admin panel:** https://pokemon-phonics.vercel.app/admin
- **Vercel project:** `pokemon-phonics` (Skillvee's Projects org)
- Deploy with `npx vercel --prod` from the project root

## Audio Status

Audio files in `public/audio/` are **not yet generated**. The game currently falls back to the browser's Web Speech API (robotic voice). To get Gemini TTS voices:
1. Go to `/admin` → TTS Narration tab → "Generate All Missing"
2. Go to `/admin` → Word Audio tab → "Generate All Missing"
3. Go to `/admin` → Phoneme Recorder → record each phoneme
Requires `GEMINI_API_KEY` in `.env.local` (or Vercel env vars for production).

## Running Locally

```bash
cd pokemon-phonics
npm install
npm run dev
```

Open http://localhost:3000 for the game, http://localhost:3000/admin for the admin panel.

## Environment Variables

Create `.env.local` with:

```
GEMINI_API_KEY=your_key_here
```

The API key is used server-side only, proxied through Next.js API routes at `/api/tts` and `/api/generate-audio`.

## Key Architecture Decisions

- **All narration is pre-generated** via the admin panel and cached as WAV files in `public/audio/`. Gemini TTS has 10-15s latency, so nothing is generated on-the-fly during gameplay.
- **Phoneme audio is parent-recorded**, not TTS. The admin panel provides a recorder for all ~44 phonemes.
- **Gemini TTS returns raw PCM** (audio/L16, 24kHz, 16-bit, mono) as base64. The `lib/pcm-to-wav.ts` utility prepends a 44-byte WAV header for browser playback.
- **Adaptive difficulty** tracks accuracy per phoneme over the last 10-20 attempts. Weak sounds surface more often.
- **No failure states** — wrong answers result in "the Pokemon fled" or "the attack missed", never a "wrong" screen.
- **Touch-first design** optimized for iPad/iPhone. Large tap targets (64x64px), no hover states, landscape preferred.

## Project Structure

- `src/app/` — Next.js App Router pages (title, map, encounter, train, battle, pokedex, admin)
- `src/components/` — Reusable React components
- `src/data/` — Phoneme definitions, word lists, Pokemon mappings, narration strings
- `src/hooks/` — Game state, audio, narration, adaptive difficulty hooks
- `src/lib/` — TTS client, PCM-to-WAV conversion, audio caching, mastery calculation
- `src/styles/` — Global CSS, Pokemon theme, animations
- `public/audio/` — Cached audio files (phonemes, TTS narration, words)

## Build Process

This project is built incrementally across multiple sessions. Each session builds one phase and **must visually verify** its work before finishing.

### Visual Testing (REQUIRED)

After building any screen or component, use `agent-browser` to verify it works on-screen:

```bash
# Start dev server first (if not running)
cd /Users/matiashoyl/Proyectos/experiments/pokemon-phonics && npm run dev &

# Open a page
agent-browser open "http://localhost:3000"

# Take screenshots to verify
agent-browser screenshot /tmp/screenshot.png
agent-browser screenshot --full /tmp/full-screenshot.png
agent-browser screenshot --annotate /tmp/annotated.png  # numbered interactive elements

# Navigate to specific pages
agent-browser open "http://localhost:3000/map"
agent-browser open "http://localhost:3000/encounter?region=1"
agent-browser open "http://localhost:3000/admin"
```

**Every session must:**
1. Read this CLAUDE.md and SPEC.md to understand what's been built and what to build next
2. Check the current build status below to know which phase to work on
3. Build the next phase
4. Run `npm run dev` and use `agent-browser` to screenshot every screen built
5. Fix any visual/functional issues found in screenshots
6. Update the build status below before ending

### Build Phases & Status

| Phase | Scope | Status |
|-------|-------|--------|
| **A: Foundation** | Project setup, data files, core hooks/lib, shared components, styles, API routes, Title Screen, World Map | COMPLETE |
| **B: Core Loop** | Wild Encounter screen (challenge types A-D), Pokeball catch animation, basic Pokedex grid | COMPLETE |
| **C: Training & Evolution** | Training screen (exercises A-F), XP system, evolution animation, shiny mechanic | COMPLETE |
| **D: Battles** | Gym Battle screen, badge system, region unlocking, gym leader dialogue | COMPLETE |
| **E: Admin Panel** | Phoneme recorder, TTS narration generator, word audio generator, progress dashboard, mapping editor | COMPLETE |
| **F: Polish** | Session timer, daily engagement, streak tracking, PWA, sound effects, Phase 2 content | PARTIAL (core done) |

### Session Handoff

When finishing a session, update the status table above and add notes about:
- What was built
- What works / what's broken
- What the next session should start with
- Any deviations from SPEC.md

### Current Notes

**Phase A completed.** What was built:
- Next.js project setup (App Router, TypeScript, no Tailwind — custom CSS)
- All data files: `phonemes.ts` (49 phonemes, Phase 1+2), `words.ts` (CVC word sets), `regions.ts` (11 regions), `pokemon.ts` (sprite URL helpers)
- Core lib: `pcm-to-wav.ts`, `mastery.ts`
- Core hooks: `useGameState.ts` (localStorage persistence), `useAudio.ts` (playback + Web Speech API fallback)
- Shared components: `PokemonSprite`, `LetterCard`, `ProgressBar`
- API route: `/api/tts` (Gemini TTS proxy with PCM→WAV conversion)
- Global styles with Pokemon theme (CSS variables, animations, letter cards, buttons)
- **Title Screen** — name entry, starter Pokemon silhouettes, gradient background, pulsing CTA
- **World Map** — 7 Phase 1 regions, lock/unlock, current region glow, caught count, Pokedex/Home nav
- **Pokedex** — full grid of 49 Pokemon as silhouettes, caught/uncaught state, evolution stage display
- **Encounter placeholder** — routes to /encounter with "Coming in Phase B" message

**What works:** Title screen renders beautifully with Pokemon silhouettes. Map shows regions with Squirtle in color for Pallet Meadow, locked regions greyed out. Pokedex shows all 49 Pokemon silhouettes. Navigation between screens works. Dev server runs on port 3001 (3000 taken).

**Phase B completed.** What was built:
- **Phoneme selection algorithm** (`src/lib/phoneme-select.ts`): Adaptive difficulty with priority scoring — struggling phonemes appear 3x more, strong ones 0.5x. Confusable pair distractors (p/b, d/g, m/n) for discrimination training.
- **Challenge generator** (`src/lib/challenge-gen.ts`): Generates challenges A-D with correct phoneme, distractor options, and word data. Challenge type auto-selected based on mastery level.
- **Wild Encounter screen** (`src/app/encounter/page.tsx`): Full encounter flow with 8 phases:
  1. Walking animation (trainer walking through grass with swaying tufts)
  2. Flash transition (classic Pokemon screen flash)
  3. "A wild [Pokemon] appeared!" with bounce-in sprite + narration
  4. Phonics challenge (Type A: sound recognition, B: grapheme recognition, C: initial sound ID, D: CVC blending)
  5. Pokeball throw animation on success (arc, shrink, 3 shakes, click)
  6. "Gotcha!" celebration with stars/confetti
  7. "Pokemon fled!" dodge animation on failure
  8. Scaffold phase (shows correct answer + mnemonic phrase for 3 seconds)
- **Encounter CSS** (`src/app/encounter/encounter.css`): Walking scene, grass tufts, trainer sprite, pokeball throw/shake animations, challenge layouts, sound option buttons, flee animation.
- Challenge Type A plays phoneme audio, waits, then accepts answer. Type B auto-plays the target sound. Type C narrates the word. Type D shows separated letters (tappable for individual sounds) with word audio options.
- State updates: `catchPokemon()` on first catch, `addAttempt()` always with responseTimeMs and challengeType, session encounter count incremented.
- Web Speech API fallback for all narration (TTS files not yet generated via admin panel).

**What works:** All 4 challenge types render correctly. Pokeball animation plays. Success flow catches Pokemon and returns to map. Failure flow shows "fled" animation, scaffold with correct answer/mnemonic, then auto-returns to map. Map shows updated caught count. Adaptive difficulty selects phonemes from current region with priority scoring.

**Phase C completed.** What was built:
- **Training exercise generator** (`src/lib/training-gen.ts`): Generates exercises A-E based on Pokemon evolution stage. Stage 1 → exercises A/B/C, Stage 2 → exercises D/E (with A/B review), Stage 3 → maintenance mix. Full session generator (5-8 exercises).
- **Training screen** (`src/app/train/page.tsx`): Full training flow with 7 phases:
  1. Pokemon selection grid — caught Pokemon with sprites, names, graphemes, XP bars. Near-evolution Pokemon have glowing yellow border + "Almost evolving!" badge.
  2. Training intro — Pokemon sprite with "Let's train [name]!" narration
  3. Exercise phase — 5 exercise types:
     - Exercise A: Sound-to-grapheme (hear sound, tap correct letter from 4 options)
     - Exercise B: Grapheme-to-sound (see letter, tap correct sound from 4 options)
     - Exercise C: Word building (hear word, tap letters in order to build it, with undo)
     - Exercise D: CVC word reading (see letters, tap each to hear sound, pick correct word)
     - Exercise E: Word matching (hear word, pick from 3 word options)
  4. Evolution animation — white glow morph from old form, reveal new form with narration
  5. Shiny animation — sparkle effect, stars confetti, shiny sprite reveal
  6. Training summary — correct/total/XP stats, XP bar, "Train another" or "Back to map"
- **Training CSS** (`src/app/train/train.css`): Pokemon selection grid, exercise layouts, build-word slots with dashed borders, evolution glow/reveal animations, shiny sparkle, summary stats.
- **Navigation updates**: Added "Train" button (green) to map bottom nav. Pokedex entries now clickable to navigate to training for that Pokemon.
- XP tracks correctly (+1 per correct answer). Evolution triggers when XP reaches thresholds (stage2: 20, stage3: 50). Shiny check happens after each correct answer (20 correct in a row).

**What works:** Pokemon selection grid renders with sprites and XP bars. All 5 exercise types work — Exercise C (word building) has tap-to-place slots with undo. Progress bar advances through exercises. Summary shows stats and XP gained. Map has Pokedex/Train/Home nav. Evolution and shiny animations are implemented but untested (require 20+ correct answers to trigger).

**Phase D completed.** What was built:
- **Gym leader data** (`src/data/gym-leaders.ts`): 7 gym leaders with names (Lila, Finn, Rocky, Marina, Bolt, Sage, Nova), signature Pokemon sprites, greetings, defeat dialogue, and HP values (5-7).
- **Battle word generator** (`src/lib/battle-gen.ts`): Generates battle words from the region's phoneme set. Difficulty ramps — first 2 words are easy CVC, middle words mix previous sets, final words are harder.
- **Gym Battle screen** (`src/app/battle/page.tsx`): Full battle flow with 6 phases:
  1. Gym entrance — animated gym building zoom-in with colored roof
  2. Leader intro — Pokemon sprite with golden glow, name, title, dialogue bubble
  3. Battle arena — HUD with leader sprite/HP bar/turn count, word attack prompt, tappable letter cards, 3 word options
  4. Attack result — "It's super effective!" with radial flash on hit, "The attack missed!" on miss
  5. Victory — "You beat [Leader]!" with greyed-out leader sprite
  6. Badge award — badge icon spins down from top, stars confetti, badge name + narration
- **Battle CSS** (`src/app/battle/battle.css`): Dark theme, HP bar with gradient, gym building, leader intro glow, battle HUD, badge spin animation.
- **Gym locked screen**: Shows when not all Pokemon are caught — displays leader's Pokemon, progress count, and "Back to map" button.
- **Map updates**: Regions with all Pokemon caught (but no badge) show red pulsing "Gym Battle!" indicator. Tapping goes to battle instead of encounter. Completed regions show green border + star badge. Badge count shown in header.
- **Region unlocking**: `earnBadge()` increments `currentSet`, unlocking the next region. After beating Lila (Region 1), Viridian Woods (Region 2) becomes accessible with yellow "current" glow.
- **Anti-frustration**: After 3 wrong in a row, leader HP drops anyway + encouraging message. Child always wins eventually.

**What works:** Full battle flow tested — gym entrance, leader intro with dialogue, 5-turn word reading battle, HP tracking, "super effective" hit flash, victory screen, badge award with spinning animation, region unlock. Map correctly shows gym-ready indicator and completed badge state.

**Phase E completed.** What was built:
- **Narration data** (`src/data/narration.ts`): 409 narration entries auto-generated from phonemes, gym leaders, regions. Categories: Encounters (appear/caught/fled), Challenges, Training, Evolution (start/complete), Battle (intro/greeting/defeat/victory/feedback), Badges, UI, Mnemonics. Each entry has key, text, voiceName (Puck/Leda/Achird), and style prefix.
- **Batch audio API** (`src/app/api/generate-audio/route.ts`): POST endpoint accepts items array, generates TTS via Gemini, saves WAV files to `public/audio/`, streams SSE progress updates. GET endpoint scans `public/audio/` to report which files exist. Rate limited at 6s between requests.
- **Admin panel** (`src/app/admin/page.tsx` + `admin.css`): 5-tab parent-facing dashboard:
  1. **Progress Dashboard** — Player stats (name, set, streak), collection counts (caught/evolved/shiny), accuracy %, badge display with colored circles, per-phoneme mastery bars (two-column, color-coded red/orange/green), weakest/strongest phoneme lists, caught Pokemon sprite grid, export JSON, reset with double confirmation (Are you sure? → type RESET).
  2. **Phoneme Recorder** — Grid of all 49 phonemes organized by Set. Each card shows grapheme, description, recorded/missing status dot, record button (microphone). Recording modal: 3-2-1 countdown, MediaRecorder capture, auto-stop at 3s, preview with audio player, save/re-record/cancel.
  3. **TTS Narration Generator** — Collapsible categories showing 409 entries. Each shows key, text, voice name, cached/missing status. Individual "Gen" button per entry. "Generate All Missing" batch button with SSE progress bar, time estimate, cancel support. Error tracking.
  4. **Word Audio Generator** — 73 unique CVC words organized by Set groups as chips. Cached words show green border and are clickable to play. "Generate All Missing" with batch progress.
  5. **Pokemon Mapping** — Full table of all 49 phonemes showing Set, grapheme, IPA sound, Pokemon name, sprite preview, and full evolution line sprites with arrows.

**What works:** All 5 admin tabs render correctly. Progress dashboard shows real game data from localStorage (4 caught Pokemon, 1 badge, 100% accuracy from previous testing). Phoneme recorder opens recording modal with countdown. TTS narration shows all 409 entries organized in 15 categories. Word audio shows 73 words in chips. Pokemon mapping table loads all sprites. Build passes cleanly.

**Phase F (partial) completed.** What was built:
- **Session timer hook** (`src/hooks/useSessionTimer.ts`): Tracks elapsed time from session start, fires warning callback at configurable threshold (default 8 min), locks session at threshold + 2 min. Updates every 15 seconds.
- **Session management in useGameState**: `startSession()` — sets startTime, tracks streak (consecutive days increment, gap > 1 day resets silently), updates lastSessionDate. `endSession()` — clears startTime, increments sessionsCompleted.
- **Session lock overlay** (`src/components/SessionLock.tsx`): Full-screen dark overlay with sleeping Pokemon (zzz animations), session stats summary (encounters/pokemon/badges), "Come back later" message. Parent unlock via math problem gate (random addition, e.g. "17 + 23 = ?").
- **Session warning toast** (`src/components/SessionWarning.tsx`): Fixed-position orange banner at top showing "Your Pokemon are getting tired!" with remaining time and dismiss button. Slides in from top.
- **Daily engagement teaser** (`src/components/DailyTeaser.tsx`): Modal shown on first login of the day. Shows "A rare Pokemon has been spotted in [Region]!" with sparkle animation. Displays streak flame at 3+ days.
- **Streak tracking**: Streak counter on map header (fire emoji + count, orange gradient pill, pulsing animation). Also shown on title screen stats and daily teaser. Streak increments for consecutive days, resets silently for gaps > 1 day. No punishment messaging.
- **Map integration**: Session timer, warning toast, and lock overlay all integrated into map screen. Parent can extend session via math gate which resets the timer.
- **Title screen integration**: Starts session on "Tap to Start", checks for new day to show daily teaser before navigating to map.
- **Admin session settings**: Session length configurable (5-30 min dropdown), shows warning/lock thresholds, current session elapsed time, and sessions completed count.
- **PWA support**: `manifest.json` (standalone, portrait, Pokemon blue theme), SVG icon, service worker (`sw.js`) that caches pages, audio files, and Pokemon sprites. Service worker registered in layout.
- **Layout updates**: Added manifest link, apple-mobile-web-app-capable meta tag, service worker registration script.

**What works:** Session timer fires warning and lock at correct thresholds. Lock overlay shows sleeping Pokemon and session stats. Parent math gate unlocks and resets timer. Daily teaser shows on first login of new day. Streak counter displays on map and title when >= 3. Admin session settings update localStorage. PWA manifest and service worker configured. Build passes cleanly.

**What's remaining for Phase F:** Sound effects (button press sounds, background music), Phase 2 content (additional word lists for Sets 8-11).

## Full Specification

See [SPEC.md](./SPEC.md) for the complete game design document including phonics pedagogy, Pokemon-to-phoneme mappings, game mechanics, data models, admin panel features, and screen-by-screen breakdown.

## Admin Panel

The admin panel at `/admin` is for the parent. It provides:
- Phoneme audio recorder (record the ~44 phoneme sounds)
- TTS narration batch generator (pre-generate all game narration)
- Word audio generator
- Child's progress dashboard
- Pokemon-to-phoneme mapping editor

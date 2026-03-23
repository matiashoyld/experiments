# Pokemon Phonics — Phase H: Game Feel & Battle Overhaul

## Overview

A collection of enhancements that make the game **feel alive** — Pokemon you can see hiding in the grass, animated sprites that breathe and bounce, battles where you fight WITH your own Pokemon, juicy celebrations, and smooth transitions between screens. These changes don't alter the phonics pedagogy — they make the existing mechanics more immersive and rewarding for a 5-year-old.

**Everything from Phases A–G stays the same** unless explicitly modified below.

---

## Design Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Animated sprites | PokeAPI showdown GIFs | Already available via `getAnimatedSprite()`, zero asset work |
| Battle system | Player picks 3 Pokemon for team | Core request from the kid; makes catching meaningful |
| Pokemon abilities | One per Pokemon, named after phoneme | Reinforces sound-letter link in a fun way |
| More Pokemon | 7 per region (from 4–7) → ~49 total stays, redistribute | Better balance; some regions had only 4 |
| Haptic feedback | `navigator.vibrate()` + fallback | Free API, huge feel improvement on mobile |
| Page transitions | CSS view transitions API | Native, no library needed, works in Safari 18+ |
| Celebration juice | Confetti particles + screen shake + floating numbers | More dopamine per success |
| Pokemon in grass | Sprite hints on explore map | Most-requested feature from the kid |
| Gym buildings | Themed per region, CSS-drawn | Replaces generic grey house |
| Evolution preview | Silhouette in Pokedex | Motivates training |

---

## H1: Pokemon Visible in Tall Grass

### Concept

When the player enters an explore map, 3–5 Pokemon from that region are placed on random tall grass tiles. They appear as **partially hidden sprites** — only the top 40% of the Pokemon is visible, as if peeking out of the grass. They bob gently up and down.

Walking to a tile with a visible Pokemon **guarantees** an encounter with that specific Pokemon (no randomness). After the encounter (caught or fled), the sprite disappears and a new one spawns elsewhere after 10 seconds.

### Visual Design

```
┌─────────────────────────────────┐
│  [tall grass] [tall grass]      │
│     🌿          🌿🔥            │  ← Torchic peeking (top 40% of sprite)
│  [tall grass]  [path]           │
│     🌿💧                        │  ← Squirtle peeking
│  [trainer]     [path]           │
└─────────────────────────────────┘
```

### Implementation

**Modified file:** `src/components/TileMap.tsx`

Add a `visiblePokemon` state: array of `{ phonemeId: string, tileX: number, tileY: number, pokedexId: number, spawnTime: number }`.

**On map load:**
1. Get the region's phoneme set → filter to uncaught Pokemon (prioritize) + caught Pokemon (lower chance)
2. Find all tall grass tiles → pick 3–5 random ones that are at least 5 tiles from spawn point
3. Place Pokemon data at those positions

**Rendering (in the Canvas draw loop):**
1. After drawing the tall grass tile, draw the Pokemon sprite on top
2. Clip to top 40% of the sprite (use `ctx.save()`, `ctx.beginPath()`, `ctx.rect()`, `ctx.clip()`)
3. Apply a gentle bob animation: `offsetY = Math.sin(time * 0.002 + tileX) * 2`
4. Draw at 0.6x tile size, centered on the tile

**Encounter trigger:**
- When the trainer's pathfinding target is a tile with a visible Pokemon, set `targetedPokemonId` in state
- On arrival, trigger the encounter with that specific Pokemon (pass `pokemonId` query param to `/encounter`)
- The encounter page reads `pokemonId` and uses that instead of random selection

**Respawn:**
- After encounter completes and player returns to explore, the old position is cleared
- After 10 seconds, a new Pokemon spawns on a different tall grass tile (if there are uncaught Pokemon remaining)

**Uncaught vs caught priority:**
- 80% chance the visible Pokemon are uncaught ones (encourages progress)
- 20% chance they're already-caught (for XP/training purposes)
- If all region Pokemon are caught, show them all as "already caught" (for battle XP)

### New query parameter

`/encounter?region=X&pokemonId=Y&from=explore` — when `pokemonId` is provided, the encounter uses that specific Pokemon instead of the random phoneme selection algorithm.

---

## H2: Animated Pokemon Sprites

### Concept

Replace static official artwork with **animated showdown GIF sprites** everywhere Pokemon appear:

| Screen | Current | New |
|--------|---------|-----|
| Wild encounter (appeared phase) | Static official artwork | Animated showdown GIF |
| Wild encounter (challenge phase) | Static, small | Animated GIF, small with idle bounce |
| Training selection grid | Static official artwork | Animated GIF |
| Training intro | Static artwork | Animated GIF with entrance bounce |
| Battle arena (leader's Pokemon) | Static artwork | Animated GIF |
| Pokedex grid | Static artwork | Animated GIF |
| Map region cards | Static artwork | Animated GIF |
| Pokeball catch phase | Static | Animated GIF shrinks into ball |

### Implementation

**Helper update** in `src/data/pokemon.ts`:

The `getAnimatedSprite(id)` function already exists and returns the showdown GIF URL. Use it as the primary sprite source everywhere.

**Fallback chain:**
1. Try animated showdown GIF (`getAnimatedSprite`)
2. If GIF fails to load (onError), fall back to official artwork (`getOfficialArtwork`)
3. The `<img>` tag should have both `src` and `onError` handler

**Create a shared component** `src/components/PokemonSprite.tsx` (update existing):

```tsx
interface PokemonSpriteProps {
  pokedexId: number;
  size?: number;       // px
  animated?: boolean;  // default true
  shiny?: boolean;
  className?: string;
}
```

- Default to animated GIF
- Add CSS class `.pokemon-sprite-idle` with gentle bounce: `translateY(-2px)` ↔ `translateY(2px)` over 2s, eased
- The bounce should have slight random delay per instance (based on pokedexId) so multiple Pokemon on screen don't sync up

**Encounter "appeared" phase enhancement:**
- Pokemon GIF bounces in (existing `bounceIn` animation)
- After landing, the GIF's own animation loop makes it feel alive
- Add a small shadow beneath that scales with the bounce

### Performance note

Showdown GIFs are small (~5-30KB each). Pre-load the region's Pokemon GIFs when entering the explore screen using `new Image()` to avoid flicker on encounter.

---

## H3: Themed Gym Buildings

### Concept

Replace the generic grey house in the gym entrance phase with a **unique building per region** that matches the region's theme. Each building is drawn with CSS (gradients + shapes) — no image assets needed.

### Gym designs

| Region | Gym Style | Key Visual Elements |
|--------|-----------|-------------------|
| 1 Pallet Meadow | Cozy cottage | White walls, red tiled roof, flower boxes under windows, green door, chimney with smoke |
| 2 Viridian Woods | Treehouse gym | Large tree trunk base, wooden platform, rope ladder, leaf canopy roof, lanterns |
| 3 Pewter Mountains | Cave entrance | Rocky arch, stalactites, glowing crystals inside, boulder door, torch sconces |
| 4 Cerulean Caves | Underwater dome | Glass dome shape, blue-tinted, bubbles rising, coral decorations, aqua glow |
| 5 Vermilion Coast | Lighthouse | Tall cylindrical tower, red/white stripes, rotating beam of light, waves at base |
| 6 Lavender Fields | Mystical pagoda | Purple tiered roof, floating orbs, crystal ball in window, misty base |
| 7 Saffron City | Modern arena | Steel/glass building, neon sign, sliding doors, spotlights, star emblems |

### Implementation

**Modified file:** `src/app/battle/page.tsx` + `src/app/battle/battle.css`

Replace the existing gym building render (the grey house) with a `<GymBuilding regionId={X} />` component.

Each gym building is a `<div>` composition using CSS:
- Multiple `<div>` layers for walls, roof, door, decorations
- CSS gradients for textures (brick, wood, stone)
- CSS animations for dynamic elements (smoke: float up + fade; lighthouse beam: rotate; bubbles: rise; orbs: float)
- The building still uses the existing `gymZoom` animation (scale 0.3 → 1)

**Example structure for Treehouse (region 2):**
```html
<div class="gym-building gym-treehouse">
  <div class="gym-tree-trunk"></div>        <!-- brown gradient cylinder -->
  <div class="gym-tree-platform"></div>     <!-- wooden floor -->
  <div class="gym-tree-walls"></div>        <!-- wood plank walls -->
  <div class="gym-tree-roof"></div>         <!-- green leaf canopy, overlapping circles -->
  <div class="gym-tree-door"></div>         <!-- small wooden door -->
  <div class="gym-tree-ladder"></div>       <!-- rope ladder (repeated dashes) -->
  <div class="gym-tree-lantern left"></div> <!-- glowing orb -->
  <div class="gym-tree-lantern right"></div>
</div>
```

**Size:** Each gym building should be roughly 200×250px, centered on screen, scaling with viewport.

---

## H4: Battle With Your Own Pokemon

### Concept

The biggest gameplay overhaul. Currently, gym battles are a pure reading quiz — the leader attacks with words and the child reads them. The child's Pokemon are not involved at all.

**New flow:** Before a gym battle, the child picks a **team of 3 Pokemon** from their caught collection. During battle, each correct answer makes one of YOUR Pokemon attack the leader's Pokemon. Each wrong answer makes the leader's Pokemon attack yours. The battle is a back-and-forth between your team and the leader's team.

### Battle Flow (Revised)

```
Phase 1: Gym Entrance         (existing, but with themed building from H3)
Phase 2: Leader Intro          (existing)
Phase 3: ★ NEW — Team Select   Pick 3 Pokemon from your caught collection
Phase 4: Battle Arena           (redesigned — split screen with your Pokemon vs leader's)
Phase 5: Attack Result          (enhanced — your Pokemon attacks or gets hit)
Phase 6: Victory / Defeat       (enhanced — your team celebrates)
Phase 7: Badge Award            (existing)
```

### Phase 3: Team Selection

**Screen layout:**
```
┌─────────────────────────────────────────┐
│         Choose your team! (3)           │
│                                         │
│  [Squirtle] [Abra] [Torchic] [Pichu]   │  ← Caught Pokemon grid
│     ⭐s       ⭐a      ⭐t      ⭐p     │  ← Their phoneme shown below
│                                         │
│  [Mudkip]                               │
│     ⭐m                                 │
│                                         │
│  ── Your Team ──────────────────────    │
│  [ slot 1 ]  [ slot 2 ]  [ slot 3 ]    │  ← Tap Pokemon above to fill
│                                         │
│          [ Battle! ]                     │  ← Enabled when 3 selected
└─────────────────────────────────────────┘
```

- Show all caught Pokemon as animated sprites with their phoneme letter beneath
- Tap to add to team (max 3), tap again to remove
- Selected Pokemon get a golden border + checkmark
- "Battle!" button appears when 3 are selected
- If fewer than 3 Pokemon caught, auto-fill and skip this screen

### Phase 4: Battle Arena (Redesigned)

**Screen layout:**
```
┌─────────────────────────────────────────┐
│  [Leader sprite] Lila    HP ████░░ 3/5  │  ← Leader HUD (top)
│                                         │
│          "Lila used Word Attack!"       │
│                                         │
│           ┌───┐ ┌───┐ ┌───┐             │
│           │ p │ │ a │ │ t │             │  ← Word letters (tap for sound)
│           └───┘ └───┘ └───┘             │
│                                         │
│     [pat]    [sat]    [mat]             │  ← Word options (tap to answer)
│                                         │
│  ─────────────────────────────────────  │
│  [🔥Torchic] [💧Squirtle] [⚡Pichu]    │  ← Your team (bottom)
│   HP ████     HP ██░░     HP ████       │
│   active ▲                              │
└─────────────────────────────────────────┘
```

**Battle mechanics:**

| Event | What happens |
|-------|-------------|
| Correct answer | Your active Pokemon attacks! Attack animation plays (Pokemon jumps forward, flash on leader's Pokemon). Leader loses 1 HP. Message: "[Pokemon] used [Ability]! It's super effective!" |
| Wrong answer | Leader's Pokemon attacks! Your active Pokemon takes damage, shake animation. Your Pokemon loses 1 HP. Message: "The attack missed! [Leader's Pokemon] strikes back!" Same word is retried (existing behavior). |
| Your Pokemon faints (0 HP) | "Oh no! [Pokemon] fainted!" — Pokemon greys out. Next Pokemon in team auto-activates. Message: "Go, [NextPokemon]!" |
| All 3 of your Pokemon faint | Battle ends. Encouraging message: "Your Pokemon need rest. Come back and try again!" Return to map. (NOT a hard fail — re-entering the gym is free.) |
| Leader's HP reaches 0 | Victory! All 3 of your Pokemon celebrate (bounce animation). Proceed to badge award. |

**Your team HP:**
- Each Pokemon has 3 HP
- HP bar shown below each sprite (small, colored by remaining HP)
- Active Pokemon is slightly larger and has a glowing base

**Anti-frustration (preserved from current):**
- After 3 consecutive wrong answers on the same word, the leader's attack "misses" — your Pokemon doesn't take damage, and a hint is shown
- The child always eventually wins (leader HP still drains after enough attempts)
- But now the child can also "lose" (all Pokemon faint) — this is a gentle loss with encouragement, not punishment

### Attack Animation

When the child answers correctly:
1. Active Pokemon sprite slides forward (translateX +30%, 0.3s)
2. A flash/impact star appears on the leader's Pokemon
3. Leader's Pokemon shakes (existing wrongShake animation)
4. Leader's HP bar decreases with a smooth animation
5. Your Pokemon slides back to position
6. Text: "[Torchic] used Fiery T-t-tap! It's super effective!"

When the child answers wrong:
1. Leader's Pokemon slides forward
2. Flash on your active Pokemon
3. Your Pokemon shakes
4. Your HP bar decreases
5. Leader slides back
6. Text: "Lila's Clefairy used Moonblast! Try again!"

---

## H5: Pokemon Abilities (Phoneme-Themed Moves)

### Concept

Every Pokemon has a signature **ability/move** whose name prominently features their phoneme sound. This name appears during battles and training, reinforcing the phoneme-Pokemon link.

### Naming Convention

The ability name should:
1. Start with or heavily feature the Pokemon's phoneme
2. Sound like a real Pokemon move (action-oriented)
3. Be fun to say out loud

### Ability Data

Add `ability` field to `PhonemeData.pokemon`:

```typescript
pokemon: {
  id: number;
  name: string;
  ability: string;          // NEW
  abilityEmoji: string;     // NEW — visual shorthand
  evolutionLine: { ... };
}
```

| Set | Pokemon | Phoneme | Ability Name | Emoji |
|-----|---------|---------|-------------|-------|
| 1 | Squirtle | s | Sssplash Strike | 💦 |
| 1 | Abra | a | Aaa-bra Beam | ✨ |
| 1 | Torchic | t | T-t-tap Fire | 🔥 |
| 1 | Pichu | p | P-p-power Spark | ⚡ |
| 2 | Igglybuff | i | Itty Bounce | 🎵 |
| 2 | Nidoran | n | Nnn-eedle Jab | 🗡️ |
| 2 | Mudkip | m | Mmm-ud Cannon | 💧 |
| 2 | Deino | d | D-d-dark Chomp | 🌑 |
| 3 | Grookey | g | G-g-grass Beat | 🥁 |
| 3 | Oshawott | o | Ocean Slash | 🌊 |
| 3 | Caterpie | c | C-c-cocoon Tackle | 🐛 |
| 3 | Krabby | k | K-k-klaw Krunch | 🦀 |
| 4 | Cyndaquil | ck | Quick Flame | 🔥 |
| 4 | Eevee | e | Eee-volve Burst | ⭐ |
| 4 | Umbreon | u | Uh-mbra Shield | 🛡️ |
| 4 | Rowlet | r | Rrr-azor Leaf | 🍃 |
| 5 | Hoppip | h | Hhh-over Gust | 💨 |
| 5 | Bulbasaur | b | B-b-bulb Blast | 🌿 |
| 5 | Fennekin | f | Fff-lame Burst | 🦊 |
| 5 | Flaaffy | ff | Fluff Shock | ⚡ |
| 5 | Litwick | l | Lll-ight Beam | 🕯️ |
| 5 | Lillipup | ll | Little Howl | 🐕 |
| 5 | Sandshrew | ss | Hiss Slash | 🏜️ |
| 6 | Jolteon | j | Jolt Jump | ⚡ |
| 6 | Vulpix | v | Vvv-ixen Flare | 🦊 |
| 6 | Wooper | w | Www-ater Slam | 💧 |
| 6 | Xatu | x | X-tra Vision | 👁️ |
| 7 | Yamper | y | Yyy-ap Zap | ⚡ |
| 7 | Zorua | z | Zzz-oom Trick | 🌀 |
| 7 | Zigzagoon | zz | Buzz Rush | 💫 |
| 7 | Quaxly | qu | Qu-qu-quack Splash | 🦆 |

### Usage in Battle

During the attack animation (Phase 4), the ability name is shown:

```
┌──────────────────────────────────────┐
│  🔥 Torchic used T-t-tap Fire!      │
│     It's super effective!            │
└──────────────────────────────────────┘
```

The phoneme part of the ability name should be rendered in a **different color** (e.g., yellow/gold) to visually emphasize the sound being practiced:

> **<span style="color:gold">T-t-t</span>ap Fire!**

### Usage in Training

When training a Pokemon, the intro shows: "Let's train [Pokemon]'s [Ability]!"

---

## H6: Evolution Preview in Pokedex

### Concept

In the Pokedex, every Pokemon entry shows its **full evolution chain** — current form in color, future forms as **dark silhouettes** with a "?" and the XP needed to evolve.

### Visual Design

**Caught Pokemon, stage 1 (e.g., Torchic at 8 XP):**
```
┌────────────────────────────┐
│   [Torchic GIF]            │  ← Full color, animated
│   Torchic                  │
│   t — "T-t-tap Fire" 🔥   │  ← Phoneme + ability
│   XP: 8 / 20              │
│   ████░░░░░░░░             │  ← XP bar
│                            │
│   Evolution:               │
│   🐣 → [???] → [???]       │
│   Torchic → ■■■ (20XP) → ■■■ (50XP)  │
│         shadow  shadow     │
└────────────────────────────┘
```

**Caught Pokemon, stage 2 (e.g., Combusken at 35 XP):**
```
│   Evolution:               │
│   ✓Torchic → [Combusken] → [???]  │
│   done        current      shadow  │
│                        ■■■ (50XP)  │
```

**Uncaught Pokemon:**
```
┌────────────────────────────┐
│   [??? silhouette]         │  ← Dark silhouette (existing)
│   ???                      │
│   Region: Pallet Meadow    │
│   "Explore to find me!"    │
└────────────────────────────┘
```

### Implementation

**Modified file:** `src/app/pokedex/page.tsx`

Currently the Pokedex is a flat grid. Add a **detail modal/page** when tapping a Pokemon:

1. Tap a Pokemon in the grid → slide-up modal with details
2. Modal shows: animated sprite, name, phoneme, ability, XP bar, evolution chain
3. Evolution chain: horizontal row of 3 sprites (stage1 → stage2 → stage3)
   - Completed stages: full color animated sprite + checkmark
   - Current stage: full color with glowing border
   - Future stages: CSS `filter: brightness(0)` silhouette + "?" label + "XX XP" below
4. Arrow (`→`) between each stage, colored gold for the next upcoming evolution
5. Tap the silhouette → tooltip: "Train [Pokemon] to [XP] XP to evolve!"

### CSS

```css
.evolution-chain {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.evolution-stage {
  text-align: center;
}
.evolution-stage.future img {
  filter: brightness(0);  /* pure black silhouette */
  opacity: 0.6;
}
.evolution-stage.current img {
  filter: drop-shadow(0 0 8px gold);
}
.evolution-arrow {
  font-size: 24px;
  color: #ccc;
}
.evolution-arrow.next {
  color: gold;
  animation: pulse 2s infinite;
}
```

---

## H7: Haptic Feedback

### Concept

Add vibration/haptic feedback on key events. On devices that support it, every correct answer, catch, and evolution feels physical.

### Haptic Events

| Event | Pattern | Intensity |
|-------|---------|-----------|
| Correct answer (any challenge) | Single short pulse: `[50]` | Light |
| Wrong answer | Double quick pulse: `[30, 50, 30]` | Light |
| Pokeball shake (each of 3) | Single medium pulse: `[80]` | Medium |
| Pokeball catch! | Long satisfying pulse: `[200]` | Strong |
| Pokemon fled | Quick triple: `[20, 40, 20, 40, 20]` | Light |
| Evolution start | Rising: `[50, 50, 100, 50, 150, 50, 200]` | Building |
| Evolution complete | Strong burst: `[300]` | Strong |
| Badge earned | Double strong: `[200, 100, 200]` | Strong |
| Battle hit (your attack) | Quick impact: `[100]` | Medium |
| Battle hit (enemy attack) | Quick double: `[50, 30, 80]` | Medium |
| Button press | Micro tap: `[10]` | Subtle |

### Implementation

**New file:** `src/hooks/useHaptics.ts`

```typescript
export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently fail — not all devices support it
      }
    }
  }, []);

  return {
    correctAnswer: () => vibrate(50),
    wrongAnswer: () => vibrate([30, 50, 30]),
    pokeballShake: () => vibrate(80),
    pokeballCatch: () => vibrate(200),
    pokemonFled: () => vibrate([20, 40, 20, 40, 20]),
    evolutionStart: () => vibrate([50, 50, 100, 50, 150, 50, 200]),
    evolutionComplete: () => vibrate(300),
    badgeEarned: () => vibrate([200, 100, 200]),
    battleHit: () => vibrate(100),
    battleTakeHit: () => vibrate([50, 30, 80]),
    buttonPress: () => vibrate(10),
  };
}
```

**Integration points:** Call the appropriate haptic function alongside existing success/failure handlers in encounter, training, and battle pages.

**Note on iOS:** `navigator.vibrate()` is NOT supported on iOS Safari. For iOS, we can use CSS `@media (hover: none)` to detect touch devices and provide extra visual feedback as compensation (screen flash, sprite shake). Future: could explore Taptic Engine via audio context workarounds, but not worth the complexity now.

---

## H8: Page Transition Animations

### Concept

Smooth animated transitions between all game screens. Currently pages just pop in. With transitions, the game feels like a continuous experience.

### Transition Types

| Navigation | Transition | Duration |
|-----------|-----------|----------|
| Map → Explore | Zoom into the region tile (scale up + fade) | 0.4s |
| Explore → Encounter | White flash (existing) → slide up new page | 0.3s |
| Encounter → Explore (return) | Fade out → fade in | 0.3s |
| Map → Train | Slide in from right | 0.3s |
| Train → Map | Slide out to right | 0.3s |
| Map → Battle | Dramatic zoom + darken | 0.5s |
| Map → Pokedex | Slide up from bottom | 0.3s |
| Pokedex → Map | Slide down | 0.3s |
| Any → Title | Fade to black → fade in | 0.5s |

### Implementation

**Approach: CSS View Transitions API**

Use the native View Transitions API (`document.startViewTransition()`), which is supported in Chrome 111+ and Safari 18+. For unsupported browsers, pages load normally (progressive enhancement).

**New file:** `src/lib/navigate.ts`

```typescript
export function navigateWithTransition(
  router: AppRouterInstance,
  path: string,
  transition: 'slide-right' | 'slide-left' | 'slide-up' | 'slide-down' | 'fade' | 'zoom' = 'fade'
) {
  const root = document.documentElement;
  root.dataset.transition = transition;

  if ('startViewTransition' in document) {
    (document as any).startViewTransition(() => {
      router.push(path);
    });
  } else {
    router.push(path);
  }
}
```

**CSS in `globals.css`:**

```css
/* View Transition animations */
::view-transition-old(root) {
  animation: var(--vt-old, fade-out 0.3s ease);
}
::view-transition-new(root) {
  animation: var(--vt-new, fade-in 0.3s ease);
}

[data-transition="slide-right"] {
  --vt-old: slide-out-left 0.3s ease;
  --vt-new: slide-in-right 0.3s ease;
}
[data-transition="slide-left"] {
  --vt-old: slide-out-right 0.3s ease;
  --vt-new: slide-in-left 0.3s ease;
}
[data-transition="slide-up"] {
  --vt-old: fade-out 0.2s ease;
  --vt-new: slide-in-up 0.3s ease;
}
[data-transition="zoom"] {
  --vt-old: zoom-out 0.4s ease;
  --vt-new: zoom-in 0.4s ease;
}

@keyframes slide-in-right { from { transform: translateX(100%); } }
@keyframes slide-out-left { to { transform: translateX(-30%); opacity: 0.5; } }
@keyframes slide-in-up { from { transform: translateY(100%); } }
@keyframes zoom-in { from { transform: scale(1.5); opacity: 0; } }
@keyframes zoom-out { to { transform: scale(0.8); opacity: 0; } }
```

**Fallback for older browsers:** No-op. Pages just navigate normally.

---

## H9: Juicier Celebrations

### Concept

The "Gotcha!" moment, badge awards, and evolutions need to feel like the biggest moments in the game. Currently they have modest animations (a few stars). We need **screen-wide confetti explosions, floating XP numbers, screen shake, and Pokemon celebration dances**.

### Confetti System

**New file:** `src/components/Confetti.tsx`

A Canvas-based particle system overlay. When triggered, spawns 80–120 particles that fall with physics.

**Particle properties:**
- Shape: random mix of rectangles, circles, and star shapes
- Colors: red, blue, yellow, green, purple, orange, pink (random per particle)
- Size: 6–14px
- Initial velocity: random upward burst (vy: -8 to -15), slight horizontal spread (vx: -4 to +4)
- Gravity: 0.15 per frame
- Rotation: random spin rate
- Fade: opacity decreases after 60% of lifetime
- Lifetime: 2–3 seconds

**Usage:**
```tsx
<Confetti trigger={showConfetti} intensity="high" />  // caught, badge, evolution
<Confetti trigger={showConfetti} intensity="low" />   // correct answer, XP gain
```

### Screen Shake

**New CSS class:** `.screen-shake`

```css
@keyframes screenShake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-4px, 2px); }
  20% { transform: translate(4px, -2px); }
  30% { transform: translate(-2px, 4px); }
  40% { transform: translate(2px, -4px); }
  50% { transform: translate(-4px, 0px); }
  60% { transform: translate(4px, 2px); }
  70% { transform: translate(-2px, -2px); }
  80% { transform: translate(2px, 4px); }
  90% { transform: translate(0px, -2px); }
}
.screen-shake {
  animation: screenShake 0.4s ease-in-out;
}
```

Applied to the page container on: catch, evolution complete, badge earned, super effective hit.

### Floating XP Numbers

**New component:** `src/components/FloatingNumber.tsx`

When XP is gained, a "+1 XP" (or "+5 XP" for catches) floats up from the Pokemon sprite and fades out.

```css
@keyframes floatUp {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-80px); opacity: 0; }
}
.floating-number {
  position: absolute;
  font-size: 24px;
  font-weight: bold;
  color: gold;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.3);
  animation: floatUp 1.2s ease-out forwards;
  pointer-events: none;
}
```

### Pokemon Celebration Dance

After catching a Pokemon or winning a battle, the Pokemon sprite does a **celebration bounce**:

```css
@keyframes celebrationDance {
  0% { transform: translateY(0) rotate(0deg); }
  15% { transform: translateY(-20px) rotate(-5deg); }
  30% { transform: translateY(0) rotate(5deg); }
  45% { transform: translateY(-15px) rotate(-3deg); }
  60% { transform: translateY(0) rotate(3deg); }
  75% { transform: translateY(-8px) rotate(0deg); }
  100% { transform: translateY(0) rotate(0deg); }
}
.pokemon-celebrate {
  animation: celebrationDance 0.8s ease-in-out;
}
```

### Enhanced Moments

| Moment | Current | New |
|--------|---------|-----|
| Correct answer | Green border on card | Green border + small confetti burst (10 particles) + floating "+1" + haptic |
| Pokeball catch | Stars fall + "Gotcha!" | Confetti explosion (100 particles) + screen shake + floating "+5 XP" + Pokemon celebration dance + haptic |
| Evolution complete | White glow reveal | Confetti + screen shake + new form celebration dance + floating "EVOLVED!" text + haptic sequence |
| Badge earned | Badge spins down + stars | Massive confetti (120 particles) + screen shake + badge spin + glowing spotlight beam from above + floating badge name + haptic |
| Gym battle hit | "Super effective!" flash | Flash + screen shake (small) + opponent shake + floating damage number + haptic |

---

## H10: More Pokemon Per Region (Rebalancing)

### Concept

Currently regions have uneven Pokemon counts (Set 1 has 4, Set 5 has 7). Rebalance to **7 Pokemon per region** for Phase 1 (Sets 1–7) by adding **new Pokemon** mapped to additional common words for each phoneme set.

The new Pokemon don't introduce new phonemes — they provide **additional practice** with the set's existing phonemes by offering alternative CVC words and different Pokemon personalities.

### Current vs New Distribution

| Set | Current Count | Current Pokemon | New Count | Added Pokemon |
|-----|-------------|----------------|----------|---------------|
| 1 | 4 | Squirtle, Abra, Torchic, Pichu | 7 | +Snivy (s), +Axew (a), +Tepig (t) |
| 2 | 4 | Igglybuff, Nidoran, Mudkip, Deino | 7 | +Inkay (i), +Noibat (n), +Magikarp (m) |
| 3 | 4 | Grookey, Oshawott, Caterpie, Krabby | 7 | +Geodude (g), +Oddish (o), +Cubone (c) |
| 4 | 4 | Cyndaquil, Eevee, Umbreon, Rowlet | 7 | +Chikorita (ck), +Emolga (e), +Ursaring (u) |
| 5 | 7 | Hoppip, Bulbasaur, Fennekin, Flaaffy, Litwick, Lillipup, Sandshrew | 7 | (no change) |
| 6 | 4 | Jolteon, Vulpix, Wooper, Xatu | 7 | +Jirachi (j), +Victini (v), +Wingull (w) |
| 7 | 4 | Yamper, Zorua, Zigzagoon, Quaxly | 7 | +Yanma (y), +Zubat (z), +Zangoose (zz) |

**New total: 49 → 58 Pokemon** (Phase 1 only)

### New Pokemon Data

Each new Pokemon needs: Pokedex ID, name, evolution line, example words, mnemonic phrase, ability.

| Pokemon | Pokedex ID | Phoneme | Evolution Line | Ability |
|---------|-----------|---------|---------------|---------|
| Snivy | 495 | s | Snivy → Servine → Serperior | Sss-lither Strike 🐍 |
| Axew | 610 | a | Axew → Fraxure → Haxorus | Aaa-xe Chomp 🪓 |
| Tepig | 498 | t | Tepig → Pignite → Emboar | T-t-tackle Blaze 🐷 |
| Inkay | 686 | i | Inkay → Malamar → Malamar | Inky Flip 🦑 |
| Noibat | 714 | n | Noibat → Noivern → Noivern | Nnn-oise Burst 🦇 |
| Magikarp | 129 | m | Magikarp → Gyarados → Gyarados | Mmm-ighty Splash 🐟 |
| Geodude | 74 | g | Geodude → Graveler → Golem | G-g-granite Throw 🪨 |
| Oddish | 43 | o | Oddish → Gloom → Vileplume | Odd Spore 🌱 |
| Cubone | 104 | c | Cubone → Marowak → Marowak | C-c-club Smash 🦴 |
| Chikorita | 152 | ck | Chikorita → Bayleef → Meganium | Quick Leaf 🌿 |
| Emolga | 587 | e | Emolga → Emolga → Emolga | Eee-lectric Glide ⚡ |
| Ursaring | 217 | u | Teddiursa → Ursaring → Ursaluna | Uh-rsa Slam 🐻 |
| Jirachi | 385 | j | Jirachi → Jirachi → Jirachi | Jolt Wish ⭐ |
| Victini | 494 | v | Victini → Victini → Victini | Vvv-ictory Flame 🏆 |
| Wingull | 278 | w | Wingull → Pelipper → Pelipper | Www-ind Gust 🌬️ |
| Yanma | 193 | y | Yanma → Yanmega → Yanmega | Yyy-ank Dive 🪰 |
| Zubat | 41 | z | Zubat → Golbat → Crobat | Zzz-oom Bite 🦇 |
| Zangoose | 335 | zz | Zangoose → Zangoose → Zangoose | Buzzsaw Slash ⚔️ |

### Implementation

1. Add new entries to `PHASE_1_PHONEMES` array in `src/data/phonemes.ts`
   - Each phoneme set will have some phonemes with 1 Pokemon and some with 2
   - The new Pokemon share the same phoneme ID as their set-mate but have different words

2. **Data structure change:** Currently each phoneme has exactly one Pokemon. To support multiple Pokemon per phoneme, change the mapping approach:

   **Option A (simpler):** Add the new Pokemon as separate phoneme entries with the same `set` but a `variant: true` flag. The phoneme selection algorithm treats them as additional practice for the same sound. This means the phoneme list grows but the sound set stays the same.

   **Option B:** Add an `additionalPokemon` array to PhonemeData. More complex but cleaner data model.

   **Recommended: Option A** — it's simpler, the encounter system already selects random phonemes from the set, and more entries = more variety automatically.

3. Update explore maps to show more Pokemon in the grass (increase from 3–5 to 4–6 visible)

4. Update map region cards to show new total (e.g., "3/7 caught" instead of "3/4 caught")

5. Update gym unlock threshold — gym battle requires catching ALL Pokemon in the region

### Note on map data

The 40×40 tile maps in `src/data/maps/` do NOT need changes — they already have plenty of tall grass tiles for more encounters. The Pokemon-in-grass feature (H1) naturally adapts to show whatever Pokemon exist for the region.

---

## Build Phases

These features are semi-independent and can be built in any order, but the recommended sequence is:

| Sub-phase | Features | Dependencies | Estimated Scope |
|-----------|----------|-------------|----------------|
| **H-1** | H2 (animated sprites), H5 (abilities data), H10 (more Pokemon data) | None — data + component changes only | Small |
| **H-2** | H7 (haptics), H8 (transitions), H9 (celebrations) | None — additive polish | Medium |
| **H-3** | H6 (evolution preview in Pokedex) | H5 for ability display | Small |
| **H-4** | H1 (Pokemon in grass) | H2 for animated sprites | Medium |
| **H-5** | H3 (themed gym buildings) | None | Medium |
| **H-6** | H4 (battle overhaul) + H5 integration | H5 for ability names, H2 for sprites, H9 for celebrations | Large |

**H-1 and H-2 can be built in parallel.** H-6 (battle overhaul) is the largest piece and should be built last since it depends on data from H-1.

---

## Files Changed Summary

### New Files
```
src/hooks/useHaptics.ts          # Haptic feedback hook
src/lib/navigate.ts              # View transition navigation helper
src/components/Confetti.tsx       # Canvas confetti particle system
src/components/FloatingNumber.tsx # Floating "+XP" animation component
src/components/GymBuilding.tsx    # Themed gym building per region
```

### Modified Files
```
src/data/phonemes.ts             # Add 18 new Pokemon entries + ability field
src/data/pokemon.ts              # (unchanged — helpers already support all IDs)
src/components/PokemonSprite.tsx  # Use animated GIF by default, fallback chain
src/components/TileMap.tsx        # Render visible Pokemon in tall grass
src/app/encounter/page.tsx       # Accept pokemonId param, use animated sprites
src/app/train/page.tsx           # Use animated sprites, show abilities
src/app/battle/page.tsx          # Full battle overhaul (team select, attack anims)
src/app/battle/battle.css        # Themed gym buildings, attack animations
src/app/pokedex/page.tsx         # Evolution preview detail modal
src/app/map/page.tsx             # Updated caught counts
src/styles/globals.css           # View transitions, screen shake, confetti CSS
```

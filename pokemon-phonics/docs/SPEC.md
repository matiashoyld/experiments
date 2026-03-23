# Pokemon Phonics Adventure — Full Specification

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Phonics Pedagogy](#phonics-pedagogy)
4. [Pokemon-to-Phonics Mapping](#pokemon-to-phonics-mapping)
5. [Game Structure](#game-structure)
6. [Game Mechanics](#game-mechanics)
7. [Audio Strategy](#audio-strategy)
8. [Data Model](#data-model)
9. [File Structure](#file-structure)
10. [Admin Panel](#admin-panel)
11. [Design & UX Guidelines](#design--ux-guidelines)
12. [API Reference](#api-reference)

---

## Overview

A web-based phonics learning game for a 5-year-old boy who loves Pokemon. The game teaches reading through Systematic Synthetic Phonics (SSP), using Pokemon collection, evolution, and battle mechanics as the engagement layer. The child knows some letter sounds but cannot blend yet.

**Target user:** 5-year-old boy, pre-reader, knows some letter sounds, cannot blend CVC words yet.

**Design philosophy:** Every interaction is a Pokemon interaction. The child never feels like they are "doing reading practice" — they are catching Pokemon, training them, and battling gym leaders. The phonics learning is the game mechanic, not a layer on top of a game.

---

## Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Framework | Next.js (App Router) | React server components where possible |
| UI | React + custom CSS | No component library. Pokemon-themed from scratch |
| TTS | Google Gemini 2.5 Flash Preview TTS | Pre-generated and cached, NOT real-time |
| Pokemon Sprites | PokeAPI (GitHub CDN) | No API key needed |
| Phoneme Audio | Parent-recorded via admin panel | Browser MediaRecorder API |
| State | localStorage | Game progress, settings |
| Audio Storage | `public/audio/` directory | WAV files for phonemes, narration, words |
| Deployment | Vercel | Static + serverless API routes |
| Environment | `.env.local` | `GEMINI_API_KEY` only |

---

## Phonics Pedagogy

The game follows **Systematic Synthetic Phonics (SSP)**, specifically the UK "Letters and Sounds" programme ordering. This is a well-researched, evidence-based approach to teaching reading.

### Why SSP?

SSP teaches children to:
1. Recognise graphemes (written letters/letter combinations)
2. Associate each grapheme with its phoneme (sound)
3. Blend phonemes together to read words (c-a-t → cat)
4. Segment words into phonemes for spelling

### Phase 1 — Single Letter Sounds

Approximately 6 weeks of content. Letters are introduced in Sets, ordered so that real words can be formed as early as possible.

| Set | Graphemes | Rationale |
|-----|-----------|-----------|
| Set 1 | s, a, t, p | Forms CVC words immediately: sat, tap, pat, at, as |
| Set 2 | i, n, m, d | Expands word pool: man, sit, pin, dim, tip, nap, tan |
| Set 3 | g, o, c, k | More words: got, cot, dog, kit, sock, mock |
| Set 4 | ck, e, u, r | Digraph ck introduced; pet, run, red, duck, neck |
| Set 5 | h, b, f, ff, l, ll, ss | Double letters introduced: hiss, bell, off, hill, buff |
| Set 6 | j, v, w, x | Less common consonants: jog, van, web, box, fox, wax |
| Set 7 | y, z, zz, qu | Final consonants + qu: yes, zip, buzz, quiz, quit |

**Key pedagogical notes:**
- **s,a,t,p first** because they form real CVC words immediately (sat, tap, pat).
- **Confusable letters (b/d) are deliberately separated** across different Sets.
- **Continuous sounds (/s/, /m/, /f/) come early** because they are easier to stretch during blending practice.
- **CVC words are introduced from Set 1 onward.** The child does not need to learn all 26 letters before reading words.

**Tricky words for Phase 1:** the, to, I, no, go, into

These are words that cannot be fully decoded with Phase 1 phonics knowledge. They are taught as "sight words" alongside phonics — in the game, these appear as rare Pokemon that are caught through a different mechanic (recognition-based rather than decoding-based).

### Phase 2 — Digraphs & Trigraphs

Approximately 12 weeks of content. The child learns that two or three letters can represent a single sound.

| Grapheme | Example Words | Type |
|----------|--------------|------|
| ch | chip, chop, much | Consonant digraph |
| sh | ship, shop, fish | Consonant digraph |
| th | thin, then, with | Consonant digraph |
| ng | ring, song, bang | Consonant digraph |
| ai | rain, tail, wait | Vowel digraph |
| ee | see, tree, feel | Vowel digraph |
| igh | high, night, light | Vowel trigraph |
| oa | boat, coat, road | Vowel digraph |
| oo | moon, food, too / book, look, good | Vowel digraph (two sounds) |
| ar | car, park, star | R-controlled vowel |
| or | for, corn, sort | R-controlled vowel |
| ur | burn, turn, fur | R-controlled vowel |
| ow | cow, now, town / snow, grow | Vowel digraph (two sounds) |
| oi | oil, coin, join | Vowel digraph |
| ear | hear, near, fear | Vowel trigraph |
| air | hair, fair, pair | Vowel trigraph |
| ure | sure, pure, cure | Vowel trigraph |
| er | her, fern, term | R-controlled vowel |

**Word patterns expand** from CVC to CCVC (ship, chip, tree) and CVCC (ring, corn, help).

**Tricky words for Phase 2:** he, she, we, me, be, was, my, you, they, her, all, are, said, so, have, like, some, come, were, there, little, one, do, when, out, what

### Mastery Criteria

A phoneme is considered "mastered" when:

| Criterion | Threshold | Measurement |
|-----------|-----------|-------------|
| Instant recall | Response in <3 seconds (ideal: <1s) | Timestamp between prompt and answer |
| Sound identification | Correct in isolation | "What sound does this letter make?" |
| Sound in words | Can identify sound at start/middle/end of words | "Tap the letter you hear at the start of 'sun'" |
| Blending (CVC) | Can blend words containing this sound | Only for Stage 2+ |
| Overall accuracy | >=80% over last 10 attempts | Rolling window |

**Spaced repetition:** Sounds below 80% accuracy appear 3x more frequently. Sounds above 90% appear at a maintenance frequency (roughly every 3rd session). Sounds never fully disappear from rotation.

---

## Pokemon-to-Phonics Mapping

Each of the ~44 phonemes is represented by a specific Pokemon. The Pokemon's name starts with (or prominently features) the target sound, creating a mnemonic link.

### Mapping Table

The full mapping is defined in `src/data/phonemes.ts`. Each entry includes:

```typescript
interface PhonemeData {
  id: string;           // Unique identifier: "s", "a", "sh", "igh", etc.
  grapheme: string;     // What is displayed visually: "s", "a", "sh", "igh"
  sound: string;        // IPA or verbal description for reference
  phase: 1 | 2;        // Which SSP phase this belongs to
  set: number;          // Set number within the phase (1-7 for Phase 1, 8+ for Phase 2)
  pokemon: {
    id: number;         // PokeAPI national Pokedex number
    name: string;       // Pokemon name
    evolutionLine: [number, number, number]; // PokeAPI IDs for 3 evolution stages
  };
  exampleWords: string[];    // CVC/CVCC words using this sound
  trickyWord?: string;       // Associated tricky word, if any
}
```

### Example Mappings (Phase 1)

| Phoneme | Grapheme | Pokemon | Dex ID | Evolution Line | Example Words |
|---------|----------|---------|--------|----------------|---------------|
| /s/ | s | Squirtle | 7 | Squirtle → Wartortle → Blastoise (7, 8, 9) | sat, sun, sip, sit |
| /a/ | a | Abra | 63 | Abra → Kadabra → Alakazam (63, 64, 65) | at, an, and, cat |
| /t/ | t | Torchic | 255 | Torchic → Combusken → Blaziken (255, 256, 257) | tap, tin, top, tip |
| /p/ | p | Pikachu | 25 | Pichu → Pikachu → Raichu (172, 25, 26) | pat, pin, pot, pan |
| /i/ | i | Igglybuff | 174 | Igglybuff → Jigglypuff → Wigglytuff (174, 39, 40) | in, it, is, sit |
| /n/ | n | Nidoran | 32 | Nidoran♂ → Nidorino → Nidoking (32, 33, 34) | nap, net, not, nip |
| /m/ | m | Mudkip | 258 | Mudkip → Marshtomp → Swampert (258, 259, 260) | man, map, mat, mop |
| /d/ | d | Deino | 633 | Deino → Zweilous → Hydreigon (633, 634, 635) | dig, dog, dip, dim |
| /g/ | g | Grookey | 810 | Grookey → Thwackey → Rillaboom (810, 811, 812) | got, gas, gap, gum |
| /o/ | o | Oshawott | 501 | Oshawott → Dewott → Samurott (501, 502, 503) | on, ox, off, hot |
| /c/ | c | Caterpie | 10 | Caterpie → Metapod → Butterfree (10, 11, 12) | cat, can, cot, cup |
| /k/ | k | Krabby | 98 | Krabby → Kingler (98, 99, 99) | kit, kid, keg |
| /ck/ | ck | Cyndaquil | 155 | Cyndaquil → Quilava → Typhlosion (155, 156, 157) | duck, sock, neck, kick |
| /e/ | e | Eevee | 133 | Eevee → Flareon (133, 136, 136) | egg, end, red, pet |
| /u/ | u | Umbreon | 197 | Umbreon (197, 197, 197) | up, us, cup, sun |
| /r/ | r | Rowlet | 722 | Rowlet → Dartrix → Decidueye (722, 723, 724) | run, red, rat, rip |
| /h/ | h | Hoppip | 187 | Hoppip → Skiploom → Jumpluff (187, 188, 189) | hat, hot, hit, hug |
| /b/ | b | Bulbasaur | 1 | Bulbasaur → Ivysaur → Venusaur (1, 2, 3) | bat, bed, big, bus |
| /f/ | f | Fennekin | 653 | Fennekin → Braixen → Delphox (653, 654, 655) | fan, fit, fig, fun |
| /ff/ | ff | Flaaffy | 180 | Mareep → Flaaffy → Ampharos (179, 180, 181) | off, puff, huff, staff |
| /l/ | l | Litwick | 607 | Litwick → Lampent → Chandelure (607, 608, 609) | leg, lip, lot, let |
| /ll/ | ll | Lillipup | 506 | Lillipup → Herdier → Stoutland (506, 507, 508) | bell, doll, hill, tall |
| /ss/ | ss | Sandshrew | 27 | Sandshrew → Sandslash (27, 28, 28) | hiss, miss, boss, mess |
| /j/ | j | Jolteon | 135 | Jolteon (135, 135, 135) | jog, jam, jet, jug |
| /v/ | v | Vulpix | 37 | Vulpix → Ninetales (37, 38, 38) | van, vet, vat, vim |
| /w/ | w | Wooper | 194 | Wooper → Quagsire → Clodsire (194, 195, 980) | wet, win, wag, web |
| /x/ | x | Xatu | 178 | Natu → Xatu (177, 178, 178) | box, fox, mix, six |
| /y/ | y | Yamper | 835 | Yamper → Boltund (835, 836, 836) | yes, yet, yam |
| /z/ | z | Zorua | 570 | Zorua → Zoroark (570, 571, 571) | zip, zap, zig |
| /zz/ | zz | Zigzagoon | 263 | Zigzagoon → Linoone → Obstagoon (263, 264, 862) | buzz, fizz, fuzz, jazz |
| /qu/ | qu | Quaxly | 912 | Quaxly → Quaxwell → Quaquaval (912, 913, 914) | quiz, quit, quip |

### Example Mappings (Phase 2 — Digraphs & Trigraphs)

| Phoneme | Grapheme | Pokemon | Dex ID | Evolution Line | Example Words |
|---------|----------|---------|--------|----------------|---------------|
| /ch/ | ch | Charmander | 4 | Charmander → Charmeleon → Charizard (4, 5, 6) | chip, chop, much, rich |
| /sh/ | sh | Shaymin | 492 | Shaymin (492, 492, 492) | ship, shop, fish, wish |
| /th/ | th | Thundurus | 642 | Thundurus (642, 642, 642) | thin, then, with, bath |
| /ng/ | ng | Tangela | 114 | Tangela → Tangrowth (114, 465, 465) | ring, song, bang, king |
| /ai/ | ai | Aipom | 190 | Aipom → Ambipom (190, 424, 424) | rain, tail, wait, mail |
| /ee/ | ee | Eelektrik | 603 | Tynamo → Eelektrik → Eelektross (602, 603, 604) | see, tree, feel, free |
| /igh/ | igh | Igglybuff | 174 | (shared — use visual evolution) | high, night, light, right |
| /oa/ | oa | Goat (Gogoat) | 673 | Skiddo → Gogoat (672, 673, 673) | boat, coat, road, toad |
| /oo/ | oo | Hoothoot | 163 | Hoothoot → Noctowl (163, 164, 164) | moon, food, too, cool |
| /ar/ | ar | Arcanine | 59 | Growlithe → Arcanine (58, 59, 59) | car, park, star, farm |
| /or/ | or | Aron | 304 | Aron → Lairon → Aggron (304, 305, 306) | for, corn, sort, fork |
| /ur/ | ur | Ursaring | 217 | Teddiursa → Ursaring → Ursaluna (216, 217, 901) | burn, turn, fur, hurt |
| /ow/ | ow | Meowth | 52 | Meowth → Persian (52, 53, 53) | cow, now, town, how |
| /oi/ | oi | Poipole | 803 | Poipole → Naganadel (803, 804, 804) | oil, coin, join, boil |
| /ear/ | ear | Deerling | 585 | Deerling → Sawsbuck (585, 586, 586) | hear, near, fear, dear |
| /air/ | air | Fletchling | 661 | Fletchling → Fletchinder → Talonflame (661, 662, 663) | hair, fair, pair, chair |
| /ure/ | ure | Lure Ball (Marill) | 183 | Azurill → Marill → Azumarill (298, 183, 184) | sure, pure, cure |
| /er/ | er | Espurr | 677 | Espurr → Meowstic (677, 678, 678) | her, fern, term, herd |

### Evolution Stage Mapping

Each Pokemon has 3 stages corresponding to phoneme mastery levels:

| Stage | Mastery Level | Pokemon Form | Game Unlock |
|-------|--------------|--------------|-------------|
| Stage 1 (Base) | Recognise grapheme + produce sound | Base Pokemon sprite | Caught via encounter |
| Stage 2 (Evolution) | Use sound in CVC/CVCC words (blending) | Evolved Pokemon sprite | Training XP threshold |
| Stage 3 (Final) | Read sound fluently in sentences | Final evolution sprite | Training XP threshold |

For Pokemon with natural 3-stage evolution lines (Charmander, Bulbasaur, Squirtle, etc.), the actual evolution line is used. For Pokemon without 3 stages, the "evolution" is represented visually:
- Stage 2: Glowing border effect + slight size increase
- Stage 3: Shiny variant + particle effects + badge overlay

**XP thresholds for evolution:**
- Stage 1 → Stage 2: 20 correct CVC word readings using this phoneme
- Stage 2 → Stage 3: 30 correct sentence readings using this phoneme

---

## Game Structure

### Screen Flow

```
Title Screen
    ↓
World Map
    ↓ (tap a route/region)
    ├── Tall Grass → Wild Encounter → [Catch success / Pokemon fled]
    ├── Training → [Select Pokemon] → Practice session → [XP gain / Evolution]
    └── Gym → Gym Battle → [Badge earned / Try again]

Pokedex (accessible from any screen via nav)
Admin Panel (/admin, separate route)
```

### Screen 1: Title Screen

**Route:** `/` (root)

**Elements:**
- Large title: "Pokemon Phonics Adventure!"
- Animated Pokemon sprites (player's top 3 caught Pokemon orbit the title, or starter Pokemon silhouettes if none caught)
- "Tap to Start!" button (large, pulsing)
- Player name display (set on first launch via a simple "What's your name, trainer?" prompt)
- Background: Pokemon-style gradient (blue sky → green grass)

**Audio:** Upbeat background jingle (optional, can be muted). "Welcome back, [name]! Your Pokemon are waiting!" narration on return visits.

**Behavior:**
- First visit: shows name entry (3-4 letter max, parent can type)
- Return visit: shows player's name and top Pokemon
- Tapping "Start" goes to World Map

### Screen 2: World Map

**Route:** `/map`

**Elements:**
- Visual overhead map (illustrated, not a real map)
- 7 regions for Phase 1 (one per Set), additional regions for Phase 2
- Each region has:
  - A name (Pokemon-themed: "Pallet Meadow", "Cerulean Caves", etc.)
  - Tall grass patches (encounter zones) — shown as tappable grass areas
  - A gym building — shown with a badge icon
  - Visual indicator: locked (greyed out) / current (glowing) / completed (badge on gym)
- Connecting routes between regions (dotted paths)
- Floating Pokemon sprites at completed regions (the caught Pokemon from that region)
- Current region is visually highlighted

**Region-to-Set mapping:**

| Region | Name | Set | Sounds | Gym Badge |
|--------|------|-----|--------|-----------|
| 1 | Pallet Meadow | Set 1 | s, a, t, p | Boulder Badge |
| 2 | Viridian Woods | Set 2 | i, n, m, d | Cascade Badge |
| 3 | Pewter Mountains | Set 3 | g, o, c, k | Thunder Badge |
| 4 | Cerulean Caves | Set 4 | ck, e, u, r | Rainbow Badge |
| 5 | Vermilion Coast | Set 5 | h, b, f, ff, l, ll, ss | Soul Badge |
| 6 | Lavender Fields | Set 6 | j, v, w, x | Marsh Badge |
| 7 | Saffron City | Set 7 | y, z, zz, qu | Volcano Badge |
| 8+ | Phase 2 regions | Sets 8+ | Digraphs/trigraphs | Earth Badge + more |

**Unlocking:** Region N+1 unlocks when Region N's gym badge is earned (i.e., the Set's sounds reach 80% mastery and the gym battle is won).

**Audio:** "Where shall we go today?" narration. Region names narrated on tap.

### Screen 3: Wild Encounter (Tall Grass)

**Route:** `/encounter`

**Query params:** `?region={regionId}` — determines which phonemes can appear.

**Flow:**

1. **Walking animation** (2-3 seconds)
   - Side-scrolling view of trainer walking through tall grass
   - Grass rustles as trainer walks
   - Screen shakes slightly

2. **Encounter trigger**
   - Screen flashes white
   - Classic Pokemon battle transition (diagonal wipe or shrinking circle)
   - "A wild [Pokemon] appeared!" text + narration
   - Pokemon sprite appears with bounce-in animation
   - Pokemon's name displayed below sprite

3. **Phonics challenge** (one of the following, randomly selected based on mastery stage)

   **Challenge Type A: Sound recognition** (Stage 1 focus)
   - Shows the grapheme large and centered (e.g., "s")
   - Narration: "What sound does this letter make?"
   - 3-4 audio buttons, each playing a different phoneme sound
   - One is correct, others are from the same Set (similar difficulty)
   - Child taps the button matching the correct sound

   **Challenge Type B: Grapheme recognition** (Stage 1 focus)
   - Plays the phoneme sound automatically
   - Narration: "Which letter makes this sound?" (sound plays)
   - 3-4 grapheme cards displayed
   - Child taps the correct grapheme

   **Challenge Type C: Initial sound identification** (Stage 1-2 bridge)
   - Shows a picture + narrates a word (e.g., shows sun image, says "sun")
   - Narration: "What sound do you hear at the start of 'sun'?"
   - 3-4 grapheme cards displayed
   - Child taps the correct initial sound

   **Challenge Type D: CVC blending** (Stage 2+ only, unlocked after catching)
   - Shows a CVC word with each letter separated: s - a - t
   - Each letter is tapped to hear its sound
   - Narration: "Can you read this word?"
   - 3-4 audio options of complete words
   - Child taps the correct word

4. **Success outcome**
   - "Gotcha! [Pokemon] was caught!" text + narration
   - Pokeball throw animation: ball arcs toward Pokemon, Pokemon shrinks into ball, ball shakes 3 times, click
   - Stars/confetti particle effect
   - Pokemon added to Pokedex at Stage 1 (or XP granted if already caught)
   - "[Pokemon] was added to your Pokedex!" (first catch) or "[Pokemon] gained experience!" (repeat)
   - Return to map

5. **Failure outcome**
   - "Oh no, [Pokemon] fled!" text + narration
   - Pokemon does a dodge animation and fades out
   - Brief pause, then: "Don't worry, [Pokemon] is still in the tall grass. You'll find it again!"
   - Correct answer is briefly shown/played (2 seconds) — scaffolded learning
   - Return to map
   - The same Pokemon/phoneme will appear again soon (increased frequency)

**Phoneme selection logic:**
- Primarily selects phonemes from the current region's Set
- 20% chance to review a phoneme from a previous Set (spaced repetition)
- Within the Set, prioritises phonemes with lower mastery scores
- Never presents a phoneme from an unlocked-but-not-yet-encountered Set

### Screen 4: Training / Practice

**Route:** `/train`

**Query params:** `?pokemon={phonemeId}` — which Pokemon to train (child selects from caught Pokemon).

**Entry:** From Pokedex or map, child selects a caught Pokemon to train.

**Flow:**

1. **Pokemon selection** (if no query param)
   - Grid of caught Pokemon
   - Each shows: sprite, name, evolution stage, XP bar to next evolution
   - Pokemon that are close to evolution have a glowing border
   - Tapping selects the Pokemon for training

2. **Training session** (5-8 challenges per session)

   **For Stage 1 Pokemon (working toward Stage 2):**

   Exercise A: Sound-to-grapheme matching
   - Play the phoneme sound → child taps the correct grapheme from 4 options

   Exercise B: Grapheme-to-sound matching
   - Show the grapheme → child taps the correct sound from 4 options

   Exercise C: Letter building (drag & drop)
   - Show 3-4 scattered letters on screen
   - Play a CVC word audio
   - Child drags the letters into order to spell the word
   - Only uses letters the child has learned (mastered phonemes)

   **For Stage 2 Pokemon (working toward Stage 3):**

   Exercise D: CVC word reading
   - Show a CVC word (e.g., "sat")
   - Narration: "Can you read this word?"
   - Each letter can be tapped to hear its individual sound
   - 3 audio options for the full word → child picks correct one

   Exercise E: Word-to-picture matching
   - Show a CVC word
   - 3 pictures displayed
   - Child taps the picture that matches the word

   **For Stage 3 Pokemon (maintenance):**

   Exercise F: Short sentence reading
   - Show a short sentence (3-5 words, all decodable)
   - Narration: "Can you read this sentence?"
   - Individual words can be tapped to hear them
   - Success = read-along with highlighting (karaoke-style)

3. **XP and evolution**
   - Each correct answer = +1 XP for that Pokemon
   - Each partially correct answer = +0.5 XP
   - XP bar fills visually after each answer
   - When XP threshold is reached:
     - Screen pauses
     - "What? [Pokemon] is evolving!" text + narration
     - Evolution animation: white glow, silhouette morphs, new form reveals
     - Celebration: fireworks, stars, congratulatory narration
     - "Congratulations! Your [Pokemon] evolved into [NewPokemon]!"

4. **Session end**
   - After 5-8 exercises: "Great training session! [Pokemon] is getting stronger!"
   - Show XP gained summary
   - Return to map or Pokedex

### Screen 5: Gym Battle

**Route:** `/battle`

**Query params:** `?gym={regionId}`

**Prerequisites:** Available only when the child has caught ALL Pokemon in a region (i.e., all phonemes in that Set have been encountered at least once).

**Flow:**

1. **Gym entrance**
   - Gym building zoom-in animation
   - "Welcome to [Region] Gym!" narration
   - Gym leader introduction: sprite + name + dialogue
   - "I am [Leader Name], the [Region] Gym Leader! Let's see if you can read!"

2. **Pokemon selection**
   - "Choose your Pokemon!" — child picks 3 Pokemon from their caught Pokemon in this region
   - Each selected Pokemon contributes "moves" (words to read) during battle

3. **Battle flow** (turn-based)

   Each turn:
   - Gym leader "attacks" — a word appears on screen
   - This is a word using the phonemes from this Set
   - Narration: "The gym leader used [Word Attack]! Can you read it?"
   - Word is displayed letter-by-letter with tappable letters
   - Child attempts to read the word:
     - 3 audio options → child picks the correct pronunciation
     - OR: free response (tap "I know it!" then hear the word to confirm)
   - **Correct:** "It's super effective!" — player's Pokemon attacks, gym leader HP decreases
   - **Partial (3 of 4 sounds correct):** "It hit! But not very effective..." — reduced damage
   - **Incorrect:** "The attack missed!" — no damage, but no penalty either

   Gym leader has 5-8 HP (one per word). Player's Pokemon have unlimited HP (child cannot lose).

4. **Gym leader difficulty scaling**
   - First 2-3 words: pure CVC words using Set phonemes
   - Middle words: mix in one phoneme from a previous Set
   - Final 1-2 words: slightly longer (CCVC/CVCC) or include a tricky word

5. **Victory**
   - Gym leader HP reaches 0
   - "You beat [Leader Name]!" celebration
   - Badge award animation: badge floats to screen center, spins, stamps onto badge case
   - "[Player] earned the [Badge Name]!"
   - Badge added to collection
   - If this unlocks a new region: "A new area has been discovered! [Next Region] is now open!"
   - Return to map (new region now visible and glowing)

6. **"Defeat" (never happens, but scaffolding)**
   - If child gets 3+ wrong in a row, the gym leader says supportive things:
     - "You're doing great! Let's try an easier one."
     - Difficulty drops: easier words, more obvious distractors
   - The child always wins the gym battle eventually
   - Gym can be replayed anytime for extra practice

### Screen 6: Pokedex

**Route:** `/pokedex`

**Elements:**
- Grid layout of ALL Pokemon (all phonemes, all phases)
- **Caught Pokemon:** Full-color sprite, name visible
- **Uncaught Pokemon:** Dark silhouette, name hidden ("???")
- **Shiny Pokemon:** Sparkle effect on sprite, special border

**Tap on caught Pokemon:**
- Large sprite display
- Pokemon name
- Phoneme: shows the grapheme + plays the sound
- Evolution stage indicator (1/3, 2/3, 3/3) with sprites for each stage
- XP progress bar (if not fully evolved)
- Example words list
- Mastery percentage
- "Train" button → goes to /train?pokemon={id}

**Stats panel (top of screen):**
- Total caught: X / 44
- Total evolved: X
- Total shinies: X
- Badges: X / 7 (or more)

### Screen 7: Admin Panel

**Route:** `/admin`

Not visible to the child. No link from game UI. Accessed directly via URL.

See [Admin Panel](#admin-panel) section for full details.

---

## Game Mechanics

### Progression System

```
Region 1 (Set 1: s,a,t,p) unlocked from start
    ↓ Encounter all 4 Pokemon (phonemes)
    ↓ Practice until 80% mastery across Set
    ↓ Beat gym battle
Region 2 (Set 2: i,n,m,d) unlocks
    ↓ ...
    ...
Region 7 (Set 7: y,z,zz,qu) → Phase 1 complete!
    ↓
Phase 2 regions unlock
```

**Within a region:**
- All phonemes in the Set are available simultaneously (not forced linear order)
- Child chooses which grass patch to explore (each may feature different phonemes)
- Gym becomes available once all Pokemon in the region are caught at least once

### Adaptive Difficulty

The adaptive system is implemented in `src/hooks/useAdaptive.ts`.

**Per-phoneme tracking:**
```typescript
// For each phoneme, track:
{
  attempts: { correct: boolean; timestamp: number; responseTimeMs: number }[]  // last 20
  accuracy: number;           // computed: correct / total over last 10
  avgResponseTime: number;    // computed: average ms over last 10
  lastSeen: number;           // timestamp
}
```

**Encounter phoneme selection algorithm:**
1. Get all phonemes in current region + previously mastered regions
2. Calculate priority score for each:
   - Base priority = 1.0
   - If accuracy < 50%: priority *= 3.0 (struggling)
   - If accuracy < 80%: priority *= 2.0 (needs work)
   - If accuracy > 90%: priority *= 0.5 (strong, reduce frequency)
   - If not seen in last 3 sessions: priority *= 1.5 (spaced review)
   - If never caught: priority *= 2.5 (new phoneme, high priority)
3. Weighted random selection based on priority scores

**Challenge type selection:**
- If phoneme accuracy < 60%: only Type A or B (easiest)
- If phoneme accuracy 60-80%: Type A, B, or C
- If phoneme accuracy > 80% and Pokemon at Stage 2+: include Type D

**Distractor selection (wrong answers):**
- Distractors come from the same Set when possible (appropriate difficulty)
- Visually/aurally confusable graphemes are used as distractors (p/b, d/g, m/n) to build discrimination
- Never use phonemes from unlearned Sets as distractors

### Session Design

**Target session length:** 7-8 minutes

**Session flow:**
1. Title screen → Map (30 seconds)
2. 3-4 wild encounters (1-2 minutes each) = 4-8 minutes
3. Optional: 1 training session (2-3 minutes)
4. Optional: gym battle if ready (3-5 minutes)

**Session time management:**
- Track session start time
- After 8 minutes: "Your Pokemon are getting tired! Time for a rest?"
- After 10 minutes: "Great job today, trainer! Your Pokemon need to rest now." (gentle lock)
- Lock shows caught Pokemon sleeping + a countdown to next session (or parent override in admin)
- Session count stored in localStorage per day

**Session ending:**
- Always end on a positive note
- If mid-encounter when timer hits, complete the current encounter first
- Show session summary: Pokemon caught, XP gained, evolution happened

**Daily engagement:**
- First login of the day: "A rare Pokemon has been spotted in [Region]!" (just a teaser, normal gameplay)
- Streak tracking: consecutive days played → streak counter visible on map
- No punishment for missing days (streak resets silently, no "you lost your streak" message)

### Failure Handling

**Core principle:** There is no failure in this game. The child is always making progress.

| Situation | Response | Design Intent |
|-----------|----------|---------------|
| Wrong answer in encounter | "Pokemon fled! Still in the tall grass." | No punishment, try again soon |
| Wrong answer in training | "Almost! Listen again..." + correct answer plays | Scaffolded retry |
| Wrong answer in battle | "The attack missed!" | No HP loss, gym leader gets friendlier |
| Multiple wrong in a row | Difficulty drops, easier options presented | Prevent frustration |
| Child seems stuck | Auto-play the correct answer, then re-ask with only 2 options | Scaffold to success |
| Child stops responding | "Take your time! Tap when you're ready." | No time pressure |

**Scaffolding cascade (3 wrong in a row on same phoneme):**
1. First wrong: show correct answer for 2 seconds, re-present with same options
2. Second wrong: reduce to 2 options (50/50), play correct sound first
3. Third wrong: auto-answer correctly, narrate "That's the /s/ sound! Like Squirtle!", move on

### Rewards

| Reward | Trigger | Visual |
|--------|---------|--------|
| Pokemon catch | Correct encounter answer | Pokeball animation + Pokedex entry |
| XP gain | Any correct answer during training | XP bar fill animation |
| Evolution | XP threshold reached | Full-screen evolution animation |
| Shiny Pokemon | 100% accuracy over 20 attempts on a phoneme | Sparkle sprite + special border |
| Gym badge | Win gym battle | Badge stamp animation |
| Region unlock | Earn gym badge | New region appears on map with fanfare |
| Streak flame | 3+ consecutive days | Flame icon on player avatar |

---

## Audio Strategy

### Audio Categories

All audio in the game falls into three categories with different production methods:

#### 1. Phoneme Sounds (Parent-recorded)

**What:** The ~44 pure phoneme sounds (/s/, /a/, /t/, /p/, /sh/, /ch/, etc.)

**Why parent-recorded:** A familiar voice is important for a young learner. The parent's pronunciation matches what the child hears at home. TTS phoneme isolation is unreliable.

**Production:**
- Recorded in the admin panel using browser MediaRecorder API
- Format: WAV, mono, 16-bit
- Storage: `public/audio/phonemes/{phonemeId}.wav` (e.g., `public/audio/phonemes/s.wav`)
- Each recording should be ~0.5-1.5 seconds
- Admin panel provides recording guide: "Say just the sound /s/, not the letter name 'ess'"

#### 2. Game Narration (Gemini TTS, pre-generated)

**What:** All spoken instructions, feedback, Pokemon names, and dialogue.

**Why Gemini TTS:** Natural, expressive voices ideal for a children's game. "Puck" voice is upbeat and engaging.

**Production:**
- All narration text strings are defined in `src/data/narration.ts`
- Generated via admin panel → calls `/api/tts` → Gemini API → PCM → WAV
- Cached in `public/audio/tts/{category}/{key}.wav`
- Estimated ~200-500 clips total

**Narration categories and examples:**

| Category | Key Pattern | Example Text | Count (est.) |
|----------|------------|-------------|--------------|
| encounter.appear.{pokemon} | encounter/appear/squirtle.wav | "A wild Squirtle appeared!" | ~44 |
| encounter.caught.{pokemon} | encounter/caught/squirtle.wav | "Gotcha! Squirtle was caught!" | ~44 |
| encounter.fled.{pokemon} | encounter/fled/squirtle.wav | "Oh no! Squirtle fled!" | ~44 |
| challenge.sound | challenge/what-sound.wav | "What sound does this letter make?" | ~5 |
| challenge.letter | challenge/which-letter.wav | "Which letter makes this sound?" | ~5 |
| challenge.blend | challenge/read-word.wav | "Can you read this word?" | ~3 |
| training.intro | training/intro.wav | "Let's train your Pokemon!" | ~5 |
| training.correct | training/correct-{n}.wav | "Great job!" / "Well done!" / etc. | ~10 |
| evolution.start.{pokemon} | evolution/start/squirtle.wav | "What? Squirtle is evolving!" | ~44 |
| evolution.complete.{pokemon} | evolution/complete/wartortle.wav | "Squirtle evolved into Wartortle!" | ~44 |
| battle.intro.{gym} | battle/intro/gym1.wav | "Welcome to Pallet Meadow Gym!" | ~7 |
| battle.hit | battle/hit-{n}.wav | "It's super effective!" | ~5 |
| battle.miss | battle/miss-{n}.wav | "The attack missed!" | ~3 |
| battle.victory.{gym} | battle/victory/gym1.wav | "You beat the gym leader!" | ~7 |
| ui.welcome | ui/welcome.wav | "Welcome back, trainer!" | ~5 |
| ui.map | ui/where-go.wav | "Where shall we go today?" | ~3 |
| **Total** | | | **~300-500** |

#### 3. Word Audio (Gemini TTS, batch-generated)

**What:** Spoken CVC/CVCC words used in challenges.

**Production:**
- Generated via admin panel in batches
- Word lists defined in `src/data/words.ts`
- Cached in `public/audio/words/{word}.wav`
- Fallback: Web Speech API (`speechSynthesis`) for any word not yet generated

**Estimated count:** ~200-400 words across all phases.

### Gemini TTS Integration

**API endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={API_KEY}`

**Request format:**
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "Say in a cheerful, excited voice: A wild Squirtle appeared!"
        }
      ]
    }
  ],
  "generationConfig": {
    "responseModalities": ["AUDIO"],
    "speechConfig": {
      "voiceConfig": {
        "prebuiltVoiceConfig": {
          "voiceName": "Puck"
        }
      }
    }
  }
}
```

**Response format:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "inlineData": {
              "mimeType": "audio/L16;rate=24000",
              "data": "<base64-encoded-pcm-data>"
            }
          }
        ]
      }
    }
  ]
}
```

**PCM to WAV conversion (`src/lib/pcm-to-wav.ts`):**
The API returns raw PCM data (Linear16, 24kHz sample rate, 16-bit, mono). To play in the browser, prepend a 44-byte WAV header:

```typescript
function pcmToWav(pcmBase64: string): ArrayBuffer {
  const pcmData = base64ToArrayBuffer(pcmBase64);
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.byteLength, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);           // chunk size
  view.setUint16(20, 1, true);            // PCM format
  view.setUint16(22, 1, true);            // mono
  view.setUint32(24, 24000, true);        // sample rate
  view.setUint32(28, 48000, true);        // byte rate (24000 * 2)
  view.setUint16(32, 2, true);            // block align
  view.setUint16(34, 16, true);           // bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.byteLength, true);

  // Combine header + PCM data
  return concatenateBuffers(wavHeader, pcmData);
}
```

**Next.js API proxy (`src/app/api/tts/route.ts`):**
- Accepts POST with `{ text: string, voiceName?: string }`
- Calls Gemini API with server-side `GEMINI_API_KEY`
- Returns WAV binary (after PCM→WAV conversion)
- Rate limiting: max 10 requests/minute (Gemini free tier)

**Voice selection:**
- Default: "Puck" (upbeat, good for game narration)
- Pokemon encounter text: "Puck"
- Instructions: "Leda" (youthful, clear enunciation)
- Gym leader dialogue: "Achird" (friendly but authoritative)
- Voice tone controlled via prompt text (e.g., "Say excitedly:", "Say gently and slowly:")

### Audio Playback

**Implementation (`src/hooks/useAudio.ts`):**

```typescript
function useAudio() {
  // Play a cached audio file
  function play(path: string): Promise<void>;

  // Play a phoneme sound
  function playPhoneme(phonemeId: string): Promise<void>;

  // Play narration
  function playNarration(key: string): Promise<void>;

  // Play a word
  function playWord(word: string): Promise<void>;

  // Stop current audio
  function stop(): void;

  // Check if audio file exists
  function hasAudio(path: string): boolean;
}
```

**Fallback chain for word audio:**
1. Check `public/audio/words/{word}.wav` (pre-generated)
2. If missing: use Web Speech API (`speechSynthesis.speak()`)
3. Log missing words for admin to generate later

---

## Data Model

### GameState (localStorage)

```typescript
interface GameState {
  version: number;            // Schema version for migrations
  playerName: string;
  currentPhase: 1 | 2;
  currentSet: number;         // 1-7 for Phase 1, 8+ for Phase 2

  pokemon: {
    [phonemeId: string]: {
      caught: boolean;
      stage: 1 | 2 | 3;
      xp: number;
      isShiny: boolean;
      attempts: {
        correct: boolean;
        timestamp: number;
        responseTimeMs: number;
        challengeType: string;
      }[];                    // Keep last 20 attempts
    };
  };

  badges: string[];           // Earned badge IDs (e.g., "gym-1", "gym-2")

  stats: {
    totalCatches: number;
    totalEvolutions: number;
    totalBattlesWon: number;
    totalCorrectAnswers: number;
    totalAttempts: number;
    sessionsCompleted: number;
  };

  session: {
    startTime: number | null; // Current session start timestamp
    encountersThisSession: number;
    lastSessionDate: string;  // YYYY-MM-DD
    streak: number;           // Consecutive days
  };

  settings: {
    voiceName: string;        // Gemini TTS voice preference
    sessionLengthMinutes: number; // Default: 8
    soundEnabled: boolean;
    musicEnabled: boolean;
  };

  createdAt: string;          // ISO date
  updatedAt: string;          // ISO date
}
```

**localStorage key:** `pokemon-phonics-game-state`

**Initialization:** On first load, if no state exists, create default state with all Pokemon uncaught, Set 1 unlocked.

**Persistence:** Save after every meaningful action (catch, XP gain, evolution, battle result). Debounce writes to avoid excessive localStorage access.

### PhonemeData (static, in code)

```typescript
interface PhonemeData {
  id: string;
  grapheme: string;
  displayGrapheme: string;    // May differ (e.g., "ck" displayed as "ck")
  sound: string;              // IPA notation
  description: string;        // Verbal description: "the /s/ sound, like a snake"
  phase: 1 | 2;
  set: number;

  pokemon: {
    id: number;               // PokeAPI national dex number
    name: string;
    evolutionLine: {
      stage1: { id: number; name: string };
      stage2: { id: number; name: string };
      stage3: { id: number; name: string };
    };
  };

  exampleWords: {
    cvc: string[];            // Simple CVC words
    ccvc?: string[];          // CCVC words (Phase 2)
    cvcc?: string[];          // CVCC words
    sentences?: string[];     // Short decodable sentences (Stage 3)
  };

  trickyWord?: string;
  mnemonicPhrase: string;     // e.g., "S is for Squirtle! /sss/"
}
```

### Word Lists (static, in code)

```typescript
interface WordSet {
  set: number;
  phase: 1 | 2;
  words: {
    word: string;
    phonemes: string[];       // Decomposition: "sat" → ["s", "a", "t"]
    type: 'cvc' | 'ccvc' | 'cvcc' | 'tricky';
    requiredSets: number[];   // Which Sets must be learned to attempt this word
  }[];
}
```

**Word list organization in `src/data/words.ts`:**
- Set 1 words (s,a,t,p only): sat, tap, pat, at, as, sap, spa, past, pats
- Set 1+2 words (adding i,n,m,d): man, sit, pin, dim, tip, nap, tan, mat, map, sip, tin, pan, pit, dip, mint, stamp
- Set 1+2+3 words (adding g,o,c,k): got, cot, dog, kit, sock, cog, mop, cod, mock, dock, tog, pig, dig, pick, tick, kick
- ... and so on, expanding as more Sets are mastered

---

## File Structure

```
pokemon-phonics/
├── CLAUDE.md                    # Project overview and dev instructions
├── SPEC.md                      # This file — full specification
├── .env.local                   # GEMINI_API_KEY=xxx (not committed)
├── .gitignore                   # Node + Next.js + .env.local + audio files
├── package.json
├── next.config.js
├── tsconfig.json
├── public/
│   ├── favicon.ico              # Pokeball favicon
│   └── audio/
│       ├── phonemes/            # Parent-recorded phoneme clips
│       │   ├── s.wav
│       │   ├── a.wav
│       │   ├── sh.wav
│       │   └── ...              # ~44 files
│       ├── tts/                 # Pre-generated Gemini TTS narration
│       │   ├── encounter/
│       │   │   ├── appear/
│       │   │   │   ├── squirtle.wav
│       │   │   │   └── ...
│       │   │   ├── caught/
│       │   │   └── fled/
│       │   ├── challenge/
│       │   ├── training/
│       │   ├── evolution/
│       │   ├── battle/
│       │   └── ui/
│       └── words/               # Generated word pronunciations
│           ├── sat.wav
│           ├── tap.wav
│           └── ...              # ~200-400 files
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout: fonts, global styles, metadata
│   │   ├── page.tsx             # Title screen
│   │   ├── map/
│   │   │   └── page.tsx         # World map
│   │   ├── encounter/
│   │   │   └── page.tsx         # Wild Pokemon encounter
│   │   ├── train/
│   │   │   └── page.tsx         # Training / practice
│   │   ├── battle/
│   │   │   └── page.tsx         # Gym battle
│   │   ├── pokedex/
│   │   │   └── page.tsx         # Pokemon collection view
│   │   ├── admin/
│   │   │   └── page.tsx         # Admin panel (parent-only)
│   │   └── api/
│   │       ├── tts/
│   │       │   └── route.ts     # Gemini TTS proxy (POST)
│   │       └── generate-audio/
│   │           └── route.ts     # Batch audio generation endpoint
│   ├── components/
│   │   ├── PokemonSprite.tsx    # Renders Pokemon sprite from PokeAPI
│   │   ├── LetterCard.tsx       # Tappable grapheme card
│   │   ├── PokeBall.tsx         # Pokeball catch animation
│   │   ├── AudioPlayer.tsx      # Audio playback component with visual feedback
│   │   ├── EvolutionAnimation.tsx # Full-screen evolution sequence
│   │   ├── BattleScene.tsx      # Battle UI layout (HP bars, sprites, attacks)
│   │   ├── WorldMap.tsx         # Illustrated map with regions
│   │   ├── TallGrass.tsx        # Walking-through-grass animation
│   │   ├── GymBadge.tsx         # Badge display component
│   │   ├── PhonemeRecorder.tsx  # Admin: microphone recording widget
│   │   ├── ProgressBar.tsx      # XP / mastery progress bar
│   │   ├── ChallengeOptions.tsx # Grid of tappable answer options
│   │   └── SessionTimer.tsx     # Session time tracker + gentle stop
│   ├── data/
│   │   ├── phonemes.ts          # All ~44 phoneme definitions + Pokemon mappings
│   │   ├── words.ts             # CVC/CVCC word lists organized by Set
│   │   ├── narration.ts         # All narration text strings (for TTS generation)
│   │   ├── pokemon.ts           # Pokemon sprite URL helpers, evolution data
│   │   ├── regions.ts           # Region/gym definitions for world map
│   │   └── badges.ts            # Badge definitions and visual data
│   ├── hooks/
│   │   ├── useGameState.ts      # Read/write game state from localStorage
│   │   ├── useAudio.ts          # Audio playback (phonemes, narration, words)
│   │   ├── useNarration.ts      # High-level narration (play encounter text, etc.)
│   │   ├── useAdaptive.ts       # Adaptive difficulty / phoneme selection
│   │   ├── useSession.ts        # Session timer and management
│   │   └── useRecorder.ts       # Admin: MediaRecorder wrapper
│   ├── lib/
│   │   ├── gemini-tts.ts        # Gemini TTS API client (server-side)
│   │   ├── pcm-to-wav.ts        # PCM (Linear16) → WAV conversion
│   │   ├── audio-cache.ts       # Check/manage cached audio files
│   │   ├── mastery.ts           # Mastery % calculation, evolution thresholds
│   │   ├── phoneme-select.ts    # Weighted phoneme selection algorithm
│   │   └── challenge-gen.ts     # Generate challenges (type, options, distractors)
│   └── styles/
│       ├── globals.css          # CSS reset, CSS variables, base typography
│       ├── pokemon-theme.css    # Pokemon-specific theming (colors, patterns)
│       └── animations.css       # Keyframe animations (catch, evolve, battle, etc.)
```

---

## Admin Panel

**Route:** `/admin`

**Access:** Direct URL only. No link from game UI. No authentication required (local/trusted use only).

### Feature 1: Phoneme Recorder

**Purpose:** Record the ~44 phoneme sounds using the parent's voice.

**UI Layout:**
- Grid of phoneme cards (7 columns for Set grouping)
- Each card shows:
  - Grapheme (large, e.g., "s")
  - Phoneme description (small, e.g., "/s/ as in sun")
  - Status indicator: green checkmark (recorded), red dot (not recorded)
  - Record button (microphone icon)
  - Play button (speaker icon, only if recorded)
  - Re-record button (refresh icon, only if recorded)

**Recording flow:**
1. Tap Record → browser requests microphone permission (first time)
2. 3-2-1 countdown displayed
3. "Recording..." indicator with live waveform visualization
4. Tap Stop (or auto-stop after 3 seconds)
5. Preview plays automatically
6. "Save" or "Re-record" buttons
7. Saved to `public/audio/phonemes/{phonemeId}.wav`

**Implementation notes:**
- Use `navigator.mediaDevices.getUserMedia({ audio: true })`
- Use `MediaRecorder` API with `audio/webm` codec, then convert to WAV
- Alternatively, use `AudioContext` + `ScriptProcessorNode` for direct PCM capture
- Display recording guide at top: "Say just the sound, not the letter name. Keep it short (under 2 seconds)."

### Feature 2: TTS Narration Generator

**Purpose:** Pre-generate all game narration via Gemini TTS.

**UI Layout:**
- Collapsible sections by category (Encounters, Challenges, Training, Evolution, Battle, UI)
- Each narration entry shows:
  - Key (e.g., "encounter.appear.squirtle")
  - Text (e.g., "A wild Squirtle appeared!")
  - Status: cached (green) / missing (grey) / generating (yellow spinner)
  - "Generate" button (individual)
  - "Preview" button (play cached audio)

**Batch operations:**
- "Generate All Missing" button at top
- Progress bar: "Generating 147 of 312 narration clips..."
- Rate limiting: 1 request every 6 seconds (10/min Gemini limit)
- Estimated time display: "~31 minutes remaining"
- Can be left running (continues in background)

**Error handling:**
- Failed generations marked in red with retry button
- Error details shown on hover
- Batch generation skips failures and continues

### Feature 3: Word Audio Generator

**Purpose:** Generate spoken word audio for all CVC/CVCC words used in challenges.

**UI Layout:**
- Word list loaded from `src/data/words.ts`
- Organized by Set
- Each word shows: word text, status (cached/missing), generate/preview buttons
- "Generate All Missing" batch button
- Custom word input: text field to add/generate additional words

### Feature 4: Progress Dashboard

**Purpose:** View the child's learning progress.

**Metrics displayed:**

| Metric | Visualization |
|--------|--------------|
| Per-phoneme mastery % | Horizontal bar chart, colored by mastery level |
| Pokemon caught | Count + grid of caught sprites |
| Pokemon evolved | Count + evolution stage breakdown |
| Shiny Pokemon | Count + sparkle grid |
| Badges earned | Badge display row |
| Session history | Calendar heatmap (days played) |
| Accuracy trend | Line chart over last 30 days |
| Time per session | Average, displayed as number |
| Weakest phonemes | Top 5 lowest mastery, highlighted for attention |
| Strongest phonemes | Top 5 highest mastery |

**Actions:**
- "Reset All Progress" button (with double confirmation: "Are you sure?" → "Type RESET to confirm")
- "Export Progress" button (downloads JSON)
- "Reset Session Timer" (override session lock for extra play)

### Feature 5: Pokemon Mapping Editor

**Purpose:** View and modify which Pokemon maps to which phoneme.

**UI Layout:**
- Table: Phoneme | Pokemon Name | Dex ID | Sprite Preview | Evolution Line Preview
- Each row is editable: change Pokemon ID → sprites update live
- "Test Encounter" button: opens encounter screen for that phoneme in a preview mode
- Validation: warns if a Pokemon ID is used for multiple phonemes

---

## Design & UX Guidelines

### Visual Design

**Color palette:**
- Primary: Pokemon Red (#FF1C1C) and Pokemon Blue (#3B4CCA)
- Background: Soft green (#E8F5E9) for grass areas, sky blue (#BBDEFB) for top
- Text: Dark charcoal (#212121) on light backgrounds
- Success: Gold (#FFD700) with star effects
- Buttons: Rounded, large, with slight shadow and press animation

**Typography:**
- Headers: Bold, rounded sans-serif (system font or Google Fonts: "Fredoka One" or "Baloo 2")
- Body/game text: Clean sans-serif, minimum 20px on mobile
- Graphemes shown to child: 48-64px, bold, high contrast
- All text narrated — child should never need to read instructions

**Layout:**
- Landscape-first design (like Pokemon games)
- Support portrait mode on iPhone (stack vertically)
- Optimized for iPad (1024x768) and iPhone (390x844)
- Full-screen / PWA capable (add manifest.json)

### Touch Interaction

- **Minimum tap target:** 48x48px (Apple HIG), prefer 64x64px for a 5-year-old
- **No hover states** — everything works on tap
- **No swipe gestures** — all navigation via tapping buttons/areas
- **No drag-and-drop** except in training letter-building exercise (and make it very forgiving with large drop zones)
- **Visual feedback on tap:** scale + color change animation (100ms)
- **No double-tap or long-press** required anywhere

### Animations

All animations use CSS transitions and keyframes. No heavy animation libraries.

| Animation | Implementation | Duration |
|-----------|---------------|----------|
| Pokeball throw | CSS keyframes: arc trajectory + bounce | 1.5s |
| Pokeball shake | CSS keyframes: rotate +-20deg, 3 times | 2s |
| Pokemon catch | Scale to 0 + fade into ball | 0.5s |
| Pokemon appear | Scale from 0 to 1 + bounce overshoot | 0.6s |
| Pokemon flee | Translate X + fade out | 0.5s |
| Evolution glow | CSS radial-gradient animation, white flash | 3s |
| Evolution morph | Cross-fade between sprites | 1s |
| XP bar fill | CSS width transition | 0.5s |
| Badge stamp | Scale from 3x to 1x + rotate | 0.8s |
| Battle attack | Translate + flash on impact | 0.4s |
| Grass rustle | CSS transform: skewX oscillation | 0.3s |
| Star particles | CSS keyframes: scatter + fade | 1s |
| Button press | Scale 0.95 + translateY 2px | 0.1s |
| Screen transition | Opacity fade or slide | 0.3s |

### Accessibility

- All interactive elements have `aria-label`
- Focus indicators for keyboard navigation (parent may use keyboard)
- Audio has visual accompaniment (text + animations) for context
- High contrast mode: all text meets WCAG AA against backgrounds
- No flashing animations faster than 3Hz

### Offline Support

- Game works offline once audio is cached (localStorage + cached static files)
- Admin panel requires internet only for TTS generation
- Pokemon sprites are loaded from CDN but can be cached via service worker (future enhancement)
- Add `next-pwa` or manual service worker for PWA support

---

## API Reference

### POST `/api/tts`

Proxies text-to-speech requests to Gemini API.

**Request:**
```json
{
  "text": "A wild Squirtle appeared!",
  "voiceName": "Puck",
  "style": "Say excitedly:"
}
```

**Response:** Binary WAV file (audio/wav)

**Error response:**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 6
}
```

**Implementation:**
1. Validate input (text length < 500 chars)
2. Construct Gemini API request with style prefix + text
3. Call Gemini API with server-side API key
4. Extract base64 PCM from response
5. Convert PCM to WAV using `pcm-to-wav.ts`
6. Return WAV binary with `Content-Type: audio/wav`
7. Rate limit: track requests, enforce 10/min

### POST `/api/generate-audio`

Batch audio generation for admin panel.

**Request:**
```json
{
  "items": [
    { "key": "encounter/appear/squirtle", "text": "A wild Squirtle appeared!", "voiceName": "Puck" },
    { "key": "encounter/appear/abra", "text": "A wild Abra appeared!", "voiceName": "Puck" }
  ]
}
```

**Response:** Server-Sent Events (SSE) stream for progress updates:
```
data: {"status": "generating", "key": "encounter/appear/squirtle", "progress": 1, "total": 2}
data: {"status": "complete", "key": "encounter/appear/squirtle"}
data: {"status": "generating", "key": "encounter/appear/abra", "progress": 2, "total": 2}
data: {"status": "complete", "key": "encounter/appear/abra"}
data: {"status": "done", "generated": 2, "failed": 0}
```

**Implementation:**
1. Accept array of items to generate
2. Process sequentially (rate limiting)
3. For each item:
   - Call Gemini TTS API
   - Convert PCM to WAV
   - Write to `public/audio/tts/{key}.wav`
   - Send SSE progress update
4. Wait 6 seconds between requests (rate limit)
5. Return summary when complete

### PokeAPI Sprite URLs (no API calls needed)

All Pokemon sprites are loaded directly from GitHub CDN. No API key or rate limiting.

```typescript
// Official artwork (high quality, PNG, ~400x400)
function getOfficialArtwork(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexId}.png`;
}

// Animated sprites (GIF, ~100x100, great for battles)
function getAnimatedSprite(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${pokedexId}.gif`;
}

// Shiny variant (for mastery reward)
function getShinyArtwork(pokedexId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokedexId}.png`;
}
```

---

## Implementation Priority

Recommended build order for incremental development:

### Phase A: Foundation
1. Next.js project setup, file structure, global styles
2. `src/data/phonemes.ts` — full phoneme + Pokemon mapping data
3. `src/data/words.ts` — word lists for Sets 1-3
4. `PokemonSprite` component (loads from PokeAPI CDN)
5. `useGameState` hook (localStorage read/write)
6. Title screen (`/`)

### Phase B: Core Loop
7. World Map (`/map`) — regions, visual layout, unlock logic
8. Wild Encounter (`/encounter`) — Challenge Types A and B
9. `useAudio` hook — play phoneme and narration audio
10. `useAdaptive` hook — phoneme selection, difficulty scaling
11. Pokeball catch animation
12. Pokedex (`/pokedex`) — basic grid view

### Phase C: Training & Evolution
13. Training screen (`/train`) — Exercises A through E
14. XP system and evolution threshold logic
15. Evolution animation
16. Shiny Pokemon mechanic

### Phase D: Battles
17. Gym Battle (`/battle`) — battle flow, HP, turns
18. Badge system
19. Region unlocking
20. Gym leader dialogue

### Phase E: Admin Panel
21. Admin layout (`/admin`)
22. Phoneme recorder (MediaRecorder)
23. TTS narration generator (Gemini API integration)
24. Word audio generator
25. Progress dashboard

### Phase F: Polish
26. Session timer and gentle stopping
27. Daily engagement teaser
28. Streak tracking
29. PWA manifest and service worker
30. Sound effects and background music (optional)
31. Phase 2 content (digraphs/trigraphs, regions 8+)

---

## Open Questions / Future Enhancements

These are not in scope for v1 but worth considering:

- **Multiplayer:** Could a second child play and compare Pokedexes?
- **Parent voice for words:** Option to record CVC words instead of using TTS?
- **Writing/spelling mode:** Reverse the flow — hear a word, spell it by selecting letters
- **Printable resources:** Generate worksheets matching in-game progress
- **Speech recognition:** Child speaks the word, game evaluates pronunciation (Web Speech API)
- **More Pokemon per phoneme:** Multiple Pokemon for the same sound, increasing collection size
- **Themed events:** Holiday Pokemon, seasonal encounters

# Pokemon Phonics — Phase G: Explorable Tile Maps

## Overview

Replace the current 2D card-based World Map with **explorable pixel-art tile maps** — one per region. The player controls a trainer sprite that walks around a classic Pokemon Red/Blue-style overhead map using **tap-to-move** controls. Walking into tall grass or cave tiles triggers random wild encounters, which transition into the existing encounter screen.

**Everything else stays the same.** Encounters, training, battles, pokedex, and admin remain unchanged. This spec only covers the new map experience.

---

## Design Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Rendering | HTML Canvas 2D | Best performance for pixel art on mobile. No framework dependency. |
| Art style | Classic Pokemon Red/Blue pixel art | Simple, nostalgic, achievable with free tilesets |
| Camera | Fixed overhead (top-down) | Matches Gen 1 style, simplest to implement |
| Controls | Tap to move | Easiest for a 5-year-old on iPad — tap a spot, character walks there |
| Map size | 40x40 tiles (per region) | Enough to explore without overwhelming a young child |
| World structure | Separate maps per region | Picked from a region select screen, simpler than one connected world |
| Encounter triggers | Tall grass patches, caves | Classic random encounter mechanic |
| Map interactables | None (keep it simple) | Just walkable terrain, grass, obstacles. No NPCs/buildings |
| Tile assets | Open-source Pokemon-style tilesets, fallback to generic RPG | Fan-made Gen 1-3 style tilesets from OpenGameArt / Spriters Resource |
| Player sprite | Classic trainer sprite (Red/Ash style) | 4-direction walking animation, pixel art |

---

## Architecture

### New Files

```
src/
  components/
    TileMap.tsx            # Canvas-based tile map renderer (React component)
    PlayerSprite.tsx       # Player sprite with walking animation state
  lib/
    tile-engine.ts         # Core tile engine: map loading, collision, camera, pathfinding
    map-data.ts            # Map definitions (40x40 tile grids for each region)
  app/
    explore/
      page.tsx             # Explore screen — region select → tile map gameplay
      explore.css          # Styles for explore page (canvas container, UI overlays)
  data/
    maps/
      region-1.ts          # Pallet Meadow map data (40x40 tile grid)
      region-2.ts          # Viridian Woods map data
      region-3.ts          # Pewter Mountains map data
      region-4.ts          # Cerulean Caves map data
      region-5.ts          # Vermilion Coast map data
      region-6.ts          # Lavender Fields map data
      region-7.ts          # Saffron City map data
      tile-types.ts        # Tile type enum and properties (walkable, encounter trigger, etc.)
public/
  tiles/
    tileset.png            # Sprite sheet with all tile graphics (grass, trees, water, paths, etc.)
    trainer.png            # Trainer sprite sheet (4 directions x walk frames)
```

### Modified Files

```
src/app/map/page.tsx       # Replace region cards with "Explore" buttons that go to /explore?region=X
                           # OR replace the map screen entirely with a region select that leads to /explore
```

---

## Tile Engine (`src/lib/tile-engine.ts`)

The core engine that powers the explorable maps.

### Tile Types

```typescript
enum TileType {
  GRASS_SHORT = 0,    // Walkable, no encounters
  GRASS_TALL = 1,     // Walkable, triggers encounters
  PATH = 2,           // Walkable, no encounters
  TREE = 3,           // Not walkable (obstacle)
  WATER = 4,          // Not walkable (obstacle)
  ROCK = 5,           // Not walkable (obstacle)
  CAVE_FLOOR = 6,     // Walkable, triggers encounters
  CAVE_WALL = 7,      // Not walkable
  FLOWER = 8,         // Walkable, decorative (no encounters)
  SAND = 9,           // Walkable, no encounters (beach areas)
  LEDGE = 10,         // One-way walkable (jump down only)
  SPAWN = 11,         // Player start position
  GYM_ENTRANCE = 12,  // Walkable, triggers gym battle when stepped on
}
```

### Core Functions

- **`loadMap(regionId: number): TileMap`** — Load a 40x40 tile grid for a region
- **`isWalkable(x: number, y: number): boolean`** — Check if a tile can be walked on
- **`isEncounterTile(x: number, y: number): boolean`** — Check if tile triggers encounters
- **`findPath(startX, startY, targetX, targetY): Point[]`** — A* pathfinding for tap-to-move
- **`getSpawnPoint(map: TileMap): Point`** — Find the SPAWN tile in a map

### Camera

- Viewport = canvas size (fills screen)
- Camera follows the player, centered
- Clamp camera at map edges so it doesn't show void
- Tile size: 16x16 pixels, rendered at 2x or 3x scale to fit the screen (32px or 48px per tile)

### Encounter Logic

- Track steps on encounter tiles (tall grass, cave floor)
- After N steps on encounter tiles, random chance of encounter (starts at 10%, increases by 5% per step, resets after encounter)
- When encounter triggers:
  1. Screen flash (white overlay, 200ms)
  2. Navigate to `/encounter?region=X` (existing encounter screen)
  3. On return from encounter, player is at the same position on the map

---

## Map Renderer (`src/components/TileMap.tsx`)

React component wrapping an HTML Canvas.

### Rendering Pipeline (each frame)

1. Clear canvas
2. Calculate camera offset (centered on player)
3. Draw visible tiles from the tileset sprite sheet (only tiles in viewport)
4. Draw player sprite at correct position with current animation frame
5. Draw any overlay effects (encounter flash, fade transitions)

### Performance

- Only render tiles visible in the viewport (not all 1600)
- Use `requestAnimationFrame` for smooth 60fps
- Sprite sheet: single PNG loaded once, draw regions with `drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)`
- Canvas size matches device pixel ratio for crisp rendering on retina displays

---

## Player Movement

### Tap-to-Move Flow

1. Player taps a point on the canvas
2. Convert screen coordinates → tile coordinates (accounting for camera offset and scale)
3. Run A* pathfinding from current position to tapped tile
4. If path found and target is walkable: animate player walking along the path, one tile at a time
5. Each tile step: update sprite direction + animation frame, check for encounter trigger
6. If encounter triggers mid-path: stop walking, trigger encounter
7. If path not found (tapped on obstacle): do nothing, or show a brief "can't go there" indicator

### Walking Animation

- 4 directions: down, up, left, right
- 3 frames per direction: stand, step-left, step-right (classic Gen 1 style)
- Walk speed: ~4 tiles per second (250ms per tile)
- Sprite sheet layout: 4 rows (directions) x 3 columns (frames), each frame 16x16 pixels

---

## Map Data Format

Each region map is a 40x40 grid of tile type numbers:

```typescript
// src/data/maps/region-1.ts
export const PALLET_MEADOW_MAP: number[][] = [
  [3, 3, 3, 3, 3, 3, 3, 3, ...],  // Row 0: trees along top edge
  [3, 0, 0, 0, 2, 2, 0, 0, ...],  // Row 1: grass and path
  [3, 0, 1, 1, 2, 1, 1, 0, ...],  // Row 2: tall grass patches
  // ... 40 rows total
];
```

### Region Themes

Each region should have a distinct visual identity through its tile composition:

| Region | Theme | Key Tiles | Encounter Zones |
|--------|-------|-----------|-----------------|
| 1. Pallet Meadow | Sunny grassland | Short grass, paths, flowers, few trees | Tall grass patches scattered around |
| 2. Viridian Woods | Dense forest | Many trees, narrow paths, clearings | Tall grass in clearings between trees |
| 3. Pewter Mountains | Rocky terrain | Rocks, cliffs, ledges, sparse grass | Cave entrances (cave floor tiles) |
| 4. Cerulean Caves | Underground caves | Cave walls, cave floor, water pools, crystals | Cave floor areas |
| 5. Vermilion Coast | Beach/coast | Sand, water, palm trees, docks | Tall grass near shoreline |
| 6. Lavender Fields | Flower meadows | Flowers, purple-tinted grass, stones | Tall grass between flower patches |
| 7. Saffron City | Urban outskirts | Paths, short grass, few trees, open areas | Tall grass patches at edges |

---

## Screen Flow

### Region Select → Explore

The current map screen (`/map`) changes behavior:

1. **Region select** — Keep the existing region card layout but now tapping a region navigates to `/explore?region=X` instead of `/encounter?region=X`
2. The `/explore` page loads the tile map for that region
3. Player walks around, encounters happen in tall grass
4. Encounters navigate to the existing `/encounter?region=X` screen
5. After encounter ends, return to `/explore?region=X` (player resumes position)
6. A "Back to Map" button overlays the canvas (top-left corner) to return to region select
7. If all Pokemon caught in region, stepping on the GYM_ENTRANCE tile navigates to `/battle?gym=X`

### State Persistence

- Player position on the map: stored in `sessionStorage` (resets each session, not persisted across days)
- Which region is being explored: URL param (`/explore?region=X`)
- Encounter count / steps: in-memory state (resets when leaving the map)

---

## Tileset & Sprite Assets

### Tileset (`public/tiles/tileset.png`)

A single sprite sheet containing all tile graphics. 16x16 pixels per tile, arranged in a grid.

**Source options (in priority order):**
1. Open-source Pokemon-style tilesets (fan-made Gen 1-3 recreations)
2. Generic RPG Maker-style tilesets (OpenGameArt.org)
3. Hand-drawn pixel art (simple enough to create)

### Trainer Sprite (`public/tiles/trainer.png`)

A 48x64 sprite sheet (3 columns x 4 rows):
- Rows: down, up, left, right
- Columns: stand, walk-left, walk-right
- Each frame: 16x16 pixels

**Source:** Fan-made Gen 1 trainer sprites (widely available) or simple custom pixel art.

---

## Build Phases

### Phase G1: Tile Engine + Renderer

- [ ] Create `tile-types.ts` with tile enum and properties
- [ ] Create `tile-engine.ts` with map loading, collision detection, A* pathfinding
- [ ] Create `TileMap.tsx` Canvas component with rendering pipeline
- [ ] Create player movement system (tap-to-move with pathfinding)
- [ ] Walking animation (4 directions, 3 frames each)
- [ ] Camera system (follow player, clamp at edges)
- [ ] Source and add tileset + trainer sprite sheets to `public/tiles/`
- [ ] Test with a simple hardcoded 20x20 map

### Phase G2: Region Maps + Encounters

- [ ] Design 7 region maps (40x40 tile grids) matching each region's theme
- [ ] Create map data files (`src/data/maps/region-*.ts`)
- [ ] Implement encounter trigger system (step counting on tall grass/cave tiles)
- [ ] Screen flash transition when encounter triggers
- [ ] Navigate to existing `/encounter?region=X` on trigger
- [ ] Return to map at same position after encounter
- [ ] GYM_ENTRANCE tile triggers navigation to `/battle?gym=X`

### Phase G3: Integration + Polish

- [ ] Modify `/map` to navigate to `/explore?region=X` for unlocked regions
- [ ] Add "Back to Map" overlay button on explore screen
- [ ] Persist player position in sessionStorage
- [ ] Handle locked regions (can't explore until previous badge earned)
- [ ] Add region name banner when entering a map
- [ ] Smooth fade transitions between screens
- [ ] Touch input polish (prevent scroll, handle edge cases)
- [ ] Visual verify all 7 maps with `agent-browser`
- [ ] Mobile performance testing (iPad/iPhone)

---

## Technical Notes

- The canvas must handle device pixel ratio for crisp rendering on retina screens (`canvas.width = canvas.clientWidth * devicePixelRatio`)
- Touch events: use `pointerdown` for cross-device compatibility (works for both touch and mouse)
- Prevent default scroll/zoom on the canvas element
- The `/explore` page should be a client component (`'use client'`) since it's all canvas + state
- Map data files are large (40x40 = 1600 numbers per map). Consider a compact encoding if bundle size matters.
- A* pathfinding on a 40x40 grid is trivial performance-wise (max 1600 nodes)

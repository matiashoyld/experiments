export enum TileType {
  GRASS_SHORT = 0,
  GRASS_TALL = 1,
  PATH = 2,
  TREE = 3,
  WATER = 4,
  ROCK = 5,
  CAVE_FLOOR = 6,
  CAVE_WALL = 7,
  FLOWER = 8,
  SAND = 9,
  LEDGE = 10,
  SPAWN = 11,
  GYM_ENTRANCE = 12,
}

export interface TileProperties {
  walkable: boolean;
  triggersEncounter: boolean;
  color: string; // fallback color if no tileset loaded
}

export const TILE_PROPERTIES: Record<TileType, TileProperties> = {
  [TileType.GRASS_SHORT]:  { walkable: true,  triggersEncounter: false, color: '#7ec850' },
  [TileType.GRASS_TALL]:   { walkable: true,  triggersEncounter: true,  color: '#4a8c28' },
  [TileType.PATH]:         { walkable: true,  triggersEncounter: false, color: '#d2b48c' },
  [TileType.TREE]:         { walkable: false, triggersEncounter: false, color: '#2d5a1e' },
  [TileType.WATER]:        { walkable: false, triggersEncounter: false, color: '#3890f8' },
  [TileType.ROCK]:         { walkable: false, triggersEncounter: false, color: '#888888' },
  [TileType.CAVE_FLOOR]:   { walkable: true,  triggersEncounter: true,  color: '#6b5a4e' },
  [TileType.CAVE_WALL]:    { walkable: false, triggersEncounter: false, color: '#3d3028' },
  [TileType.FLOWER]:       { walkable: true,  triggersEncounter: false, color: '#e8a0c8' },
  [TileType.SAND]:         { walkable: true,  triggersEncounter: false, color: '#f0e0a0' },
  [TileType.LEDGE]:        { walkable: true,  triggersEncounter: false, color: '#a0885c' },
  [TileType.SPAWN]:        { walkable: true,  triggersEncounter: false, color: '#7ec850' },
  [TileType.GYM_ENTRANCE]: { walkable: true,  triggersEncounter: false, color: '#c03028' },
};

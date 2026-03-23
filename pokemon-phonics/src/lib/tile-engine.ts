import { TileType, TILE_PROPERTIES } from '@/data/maps/tile-types';

export interface Point {
  x: number;
  y: number;
}

export interface TileMap {
  width: number;
  height: number;
  tiles: number[][];
  spawn: Point;
}

export function getSpawnPoint(tiles: number[][]): Point {
  for (let y = 0; y < tiles.length; y++) {
    for (let x = 0; x < tiles[y].length; x++) {
      if (tiles[y][x] === TileType.SPAWN) {
        return { x, y };
      }
    }
  }
  // Default to center if no spawn found
  return { x: Math.floor(tiles[0].length / 2), y: Math.floor(tiles.length / 2) };
}

export function loadMap(tiles: number[][]): TileMap {
  return {
    width: tiles[0].length,
    height: tiles.length,
    tiles,
    spawn: getSpawnPoint(tiles),
  };
}

export function getTile(map: TileMap, x: number, y: number): TileType {
  if (x < 0 || y < 0 || y >= map.height || x >= map.width) return TileType.TREE;
  return map.tiles[y][x] as TileType;
}

export function isWalkable(map: TileMap, x: number, y: number): boolean {
  const tile = getTile(map, x, y);
  return TILE_PROPERTIES[tile]?.walkable ?? false;
}

export function isEncounterTile(map: TileMap, x: number, y: number): boolean {
  const tile = getTile(map, x, y);
  return TILE_PROPERTIES[tile]?.triggersEncounter ?? false;
}

// A* pathfinding
export function findPath(map: TileMap, start: Point, end: Point): Point[] {
  if (!isWalkable(map, end.x, end.y)) return [];
  if (start.x === end.x && start.y === end.y) return [];

  interface Node {
    x: number;
    y: number;
    g: number;
    h: number;
    f: number;
    parent: Node | null;
  }

  const heuristic = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const key = (x: number, y: number) => `${x},${y}`;

  const open: Node[] = [];
  const closed = new Set<string>();

  open.push({ x: start.x, y: start.y, g: 0, h: heuristic(start, end), f: heuristic(start, end), parent: null });

  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];

  while (open.length > 0) {
    // Find node with lowest f
    let lowestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[lowestIdx].f) lowestIdx = i;
    }
    const current = open.splice(lowestIdx, 1)[0];

    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path: Point[] = [];
      let node: Node | null = current;
      while (node && !(node.x === start.x && node.y === start.y)) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    closed.add(key(current.x, current.y));

    for (const dir of directions) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      const k = key(nx, ny);

      if (closed.has(k) || !isWalkable(map, nx, ny)) continue;

      const g = current.g + 1;
      const h = heuristic({ x: nx, y: ny }, end);
      const existingIdx = open.findIndex(n => n.x === nx && n.y === ny);

      if (existingIdx === -1) {
        open.push({ x: nx, y: ny, g, h, f: g + h, parent: current });
      } else if (g < open[existingIdx].g) {
        open[existingIdx].g = g;
        open[existingIdx].f = g + h;
        open[existingIdx].parent = current;
      }
    }
  }

  return []; // No path found
}

// Direction from one point to the next
export type Direction = 'down' | 'up' | 'left' | 'right';

export function getDirection(from: Point, to: Point): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

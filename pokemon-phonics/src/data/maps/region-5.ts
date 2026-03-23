// Vermilion Coast — A beautiful coastline with waves and Pokemon!
// Beach area with sand, water, and grass near shoreline
import { TileType as T } from './tile-types';

const _ = T.GRASS_SHORT;
const G = T.GRASS_TALL;
const P = T.PATH;
const X = T.TREE;
const W = T.WATER;
const R = T.ROCK;
const D = T.SAND;
const S = T.SPAWN;
const E = T.GYM_ENTRANCE;

export const VERMILION_COAST: number[][] = [
  [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
  [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
  [X,X,_,_,_,_,_,G,G,G,_,_,_,_,_,P,P,_,_,_,_,_,P,P,_,_,_,_,_,G,G,G,_,_,_,_,_,_,X,X],
  [X,X,_,_,_,_,G,G,G,G,G,_,_,_,P,P,_,_,_,_,_,_,_,P,P,_,_,_,G,G,G,G,G,_,_,_,_,_,X,X],
  [X,X,_,_,X,_,G,G,G,G,_,_,_,P,P,_,_,_,_,_,_,_,_,_,P,P,_,_,_,G,G,G,G,_,X,_,_,_,X,X],
  [X,X,_,_,X,_,_,G,G,_,_,_,P,P,_,_,_,_,_,_,_,_,_,_,_,P,P,_,_,_,G,G,_,_,X,_,_,_,X,X],
  [X,X,_,_,_,_,_,_,_,_,_,P,P,_,_,_,_,R,_,_,_,_,R,_,_,_,P,P,_,_,_,_,_,_,_,_,_,_,X,X],
  [X,X,_,_,_,_,_,_,_,_,P,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,P,P,_,_,_,_,_,_,_,_,_,X,X],
  [X,X,G,G,_,_,_,_,_,P,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,P,P,_,_,_,_,_,G,G,_,X,X],
  [X,X,G,G,G,_,_,_,P,P,_,_,_,_,_,D,D,D,D,D,D,D,D,D,D,_,_,_,_,P,P,_,_,_,G,G,G,_,X,X],
  [X,X,_,G,_,_,_,P,P,_,_,_,_,_,D,D,D,D,D,D,D,D,D,D,D,D,_,_,_,_,P,P,_,_,_,G,_,_,X,X],
  [X,X,_,_,_,_,P,P,_,_,_,_,_,D,D,D,D,D,D,D,D,D,D,D,D,D,D,_,_,_,_,P,P,_,_,_,_,_,X,X],
  [X,X,_,_,_,P,P,_,_,_,_,_,D,D,D,D,D,R,D,D,D,D,R,D,D,D,D,D,_,_,_,_,P,P,_,_,_,_,X,X],
  [X,X,_,_,P,P,_,_,_,_,_,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,_,_,_,_,P,P,_,_,_,X,X],
  [X,X,_,P,P,_,_,_,_,_,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,_,_,_,_,P,P,_,_,X,X],
  [X,X,P,P,_,_,_,_,_,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,_,_,_,_,P,P,_,X,X],
  [X,X,P,_,_,_,_,_,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,D,_,_,_,_,P,_,X,X],
  [X,X,P,_,_,_,_,D,D,D,D,D,D,D,D,W,W,W,W,W,W,W,W,W,W,D,D,D,D,D,D,D,D,_,_,_,P,_,X,X],
  [X,X,P,_,_,_,D,D,D,D,D,D,D,D,W,W,W,W,W,W,W,W,W,W,W,W,D,D,D,D,D,D,D,D,_,_,P,_,X,X],
  [X,X,P,_,_,D,D,D,D,D,D,D,D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,D,D,D,D,D,D,D,D,_,P,_,X,X],
  [X,X,P,_,_,D,D,D,D,D,D,D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,D,D,D,D,D,D,D,_,P,_,X,X],
  [X,X,P,_,D,D,D,D,D,D,D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,D,D,D,D,D,D,D,P,_,X,X],
  [X,X,P,_,D,D,D,D,D,D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,D,D,D,D,D,D,P,_,X,X],
  [X,X,P,_,D,D,D,D,D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,D,D,D,D,D,P,_,X,X],
  [X,X,P,_,D,D,D,D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,D,D,D,D,P,_,X,X],
  [X,X,P,_,D,D,D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,D,D,D,P,_,X,X],
  [X,X,P,_,D,D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,D,D,P,_,X,X],
  [X,X,P,_,D,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,D,P,_,X,X],
  [X,X,P,_,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,P,_,X,X],
  [X,X,P,_,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,P,_,X,X],
  [X,X,P,_,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,P,_,X,X],
  [X,X,P,_,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,P,_,X,X],
  [X,X,P,P,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,P,P,X,X],
  [X,X,_,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,_,X,X],
  [X,X,_,_,_,_,_,_,_,_,_,_,_,P,P,P,P,P,P,S,S,P,P,P,P,P,P,_,_,_,_,_,_,_,_,_,_,_,X,X],
  [X,X,_,_,_,G,G,G,_,_,_,_,_,_,_,_,_,_,_,S,S,_,_,_,_,_,_,_,_,_,_,_,G,G,G,_,_,_,X,X],
  [X,X,_,_,_,G,G,G,_,_,_,_,_,_,_,_,_,_,_,P,P,_,_,_,_,_,_,_,_,_,_,_,G,G,G,E,E,_,X,X],
  [X,X,_,_,_,_,G,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,G,_,_,_,_,X,X],
  [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
  [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
];

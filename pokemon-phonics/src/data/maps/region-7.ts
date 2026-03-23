// Saffron City — A big city where the strongest trainers gather!
// Urban outskirts with paths, open areas, and grass patches at edges
import { TileType as T } from './tile-types';

const _ = T.GRASS_SHORT;
const G = T.GRASS_TALL;
const P = T.PATH;
const X = T.TREE;
const R = T.ROCK;
const F = T.FLOWER;
const S = T.SPAWN;
const E = T.GYM_ENTRANCE;

export const SAFFRON_CITY: number[][] = [
  [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
  [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
  [X,X,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,X,X],
  [X,X,P,_,_,_,_,_,P,_,_,_,_,_,P,_,_,_,_,_,_,_,_,_,_,P,_,_,_,_,_,P,_,_,_,_,_,P,X,X],
  [X,X,P,_,G,G,G,_,P,_,F,F,F,_,P,_,_,_,_,_,_,_,_,_,_,P,_,F,F,F,_,P,_,G,G,G,_,P,X,X],
  [X,X,P,_,G,G,G,_,P,_,F,F,F,_,P,_,_,P,P,P,P,P,P,_,_,P,_,F,F,F,_,P,_,G,G,G,_,P,X,X],
  [X,X,P,_,G,G,G,_,P,_,F,_,F,_,P,_,P,P,_,_,_,_,P,P,_,P,_,F,_,F,_,P,_,G,G,G,_,P,X,X],
  [X,X,P,_,_,G,_,_,P,_,_,_,_,_,P,_,P,_,_,_,_,_,_,P,_,P,_,_,_,_,_,P,_,_,G,_,_,P,X,X],
  [X,X,P,_,_,_,_,_,P,_,_,_,_,_,P,_,P,_,_,R,R,_,_,P,_,P,_,_,_,_,_,P,_,_,_,_,_,P,X,X],
  [X,X,P,P,P,P,P,P,P,P,P,_,P,P,P,_,P,_,_,R,R,_,_,P,_,P,P,P,_,P,P,P,P,P,P,P,P,P,X,X],
  [X,X,P,_,_,_,_,_,_,_,_,_,_,_,_,_,P,_,_,_,_,_,_,P,_,_,_,_,_,_,_,_,_,_,_,_,_,P,X,X],
  [X,X,P,_,_,_,_,_,_,_,_,_,_,_,_,_,P,P,_,_,_,_,P,P,_,_,_,_,_,_,_,_,_,_,_,_,_,P,X,X],
  [X,X,P,P,P,P,P,P,P,P,P,_,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,_,P,P,P,P,P,P,P,P,P,X,X],
  [X,X,P,_,_,_,_,_,P,_,_,_,_,_,P,_,_,_,_,P,P,_,_,_,_,P,_,_,_,_,_,P,_,_,_,_,_,P,X,X],
  [X,X,P,_,G,G,G,_,P,_,_,_,_,_,P,_,_,_,_,P,P,_,_,_,_,P,_,_,_,_,_,P,_,G,G,G,_,P,X,X],
  [X,X,P,_,G,G,G,_,P,_,G,G,G,_,P,_,_,_,_,P,P,_,_,_,_,P,_,G,G,G,_,P,_,G,G,G,_,P,X,X],
  [X,X,P,_,G,G,G,_,P,_,G,G,G,_,P,_,_,_,P,P,P,P,_,_,_,P,_,G,G,G,_,P,_,G,G,G,_,P,X,X],
  [X,X,P,_,_,G,_,_,P,_,G,G,G,_,P,_,_,P,P,_,_,P,P,_,_,P,_,G,G,G,_,P,_,_,G,_,_,P,X,X],
  [X,X,P,_,_,_,_,_,P,_,_,G,_,_,P,_,P,P,_,_,_,_,P,P,_,P,_,_,G,_,_,P,_,_,_,_,_,P,X,X],
  [X,X,P,_,_,_,_,_,P,_,_,_,_,_,P,_,P,_,_,_,_,_,_,P,_,P,_,_,_,_,_,P,_,_,_,_,_,P,X,X],
  [X,X,P,P,P,P,P,P,P,P,P,_,P,P,P,_,P,_,_,_,_,_,_,P,_,P,P,P,_,P,P,P,P,P,P,P,P,P,X,X],
  [X,X,P,_,_,_,_,_,_,_,_,_,_,_,_,_,P,_,_,F,F,_,_,P,_,_,_,_,_,_,_,_,_,_,_,_,_,P,X,X],
  [X,X,P,_,_,_,_,_,_,_,_,_,_,_,_,_,P,P,_,F,F,_,P,P,_,_,_,_,_,_,_,_,_,_,_,_,_,P,X,X],
  [X,X,P,P,P,P,P,P,P,P,P,_,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,P,_,P,P,P,P,P,P,P,P,P,X,X],
  [X,X,P,_,_,_,_,_,P,_,_,_,_,_,P,_,_,_,_,P,P,_,_,_,_,P,_,_,_,_,_,P,_,_,_,_,_,P,X,X],
  [X,X,P,_,G,G,G,_,P,_,F,F,_,_,P,_,_,_,_,P,P,_,_,_,_,P,_,_,F,F,_,P,_,G,G,G,_,P,X,X],
  [X,X,P,_,G,G,G,_,P,_,F,F,F,_,P,_,_,_,_,P,P,_,_,_,_,P,_,F,F,F,_,P,_,G,G,G,_,P,X,X],
  [X,X,P,_,G,G,G,_,P,_,_,F,F,_,P,_,_,_,P,P,P,P,_,_,_,P,_,F,F,_,_,P,_,G,G,G,_,P,X,X],
  [X,X,P,_,_,G,_,_,P,_,_,_,_,_,P,_,_,P,P,_,_,P,P,_,_,P,_,_,_,_,_,P,_,_,G,_,_,P,X,X],
  [X,X,P,_,_,_,_,_,P,_,_,_,_,_,P,_,P,P,_,_,_,_,P,P,_,P,_,_,_,_,_,P,_,_,_,_,_,P,X,X],
  [X,X,P,_,_,_,_,_,P,_,_,_,_,_,P,P,P,_,_,_,_,_,_,P,P,P,_,_,_,_,_,P,_,_,_,_,_,P,X,X],
  [X,X,P,P,P,P,P,P,P,P,P,P,P,P,P,_,_,_,_,_,_,_,_,_,_,P,P,P,P,P,P,P,P,P,P,P,P,P,X,X],
  [X,X,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,P,P,P,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,X,X],
  [X,X,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,P,P,_,_,P,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,X,X],
  [X,X,_,_,_,G,G,_,_,_,_,_,P,P,P,P,P,P,_,S,S,_,P,P,P,P,P,P,_,_,_,_,_,G,G,_,_,_,X,X],
  [X,X,_,_,_,G,G,G,_,_,_,_,P,_,_,_,_,_,_,S,S,_,_,_,_,_,_,P,_,_,_,_,G,G,G,_,_,_,X,X],
  [X,X,_,_,_,_,G,_,_,_,_,_,P,_,_,_,_,_,_,P,P,_,_,_,_,_,_,P,_,_,_,_,E,E,_,_,_,_,X,X],
  [X,X,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,X,X],
  [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
  [X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X,X],
];

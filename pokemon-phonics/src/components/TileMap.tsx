'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { TileType, TILE_PROPERTIES } from '@/data/maps/tile-types';
import { TileMap as TileMapData, Point, findPath, getDirection, Direction, isWalkable, isEncounterTile, getTile } from '@/lib/tile-engine';
import { getOfficialArtwork } from '@/data/pokemon';

export interface VisiblePokemon {
  phonemeId: string;
  tileX: number;
  tileY: number;
  pokedexId: number;
  pokemonName: string;
}

const BASE_TILE_SIZE = 16;

// Helper function to draw a bushy grass tuft (used in tall grass)
function drawGrassTuft(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, windOffset: number) {
  const h = size * 0.8;
  const w = size * 0.6;

  // Shadow at the base
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(x, y, w * 0.8, w * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back dark leaves
  ctx.fillStyle = '#2A6D26';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - w + windOffset * 0.5, y - h * 0.6);
  ctx.lineTo(x - w * 0.3 + windOffset, y - h * 0.2);
  ctx.lineTo(x + windOffset * 1.5, y - h);
  ctx.lineTo(x + w * 0.3 + windOffset, y - h * 0.2);
  ctx.lineTo(x + w + windOffset * 0.5, y - h * 0.6);
  ctx.closePath();
  ctx.fill();

  // Mid leaves
  ctx.fillStyle = '#43A03B';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - w * 0.7 + windOffset * 0.8, y - h * 0.4);
  ctx.lineTo(x - w * 0.2 + windOffset, y - h * 0.1);
  ctx.lineTo(x + windOffset * 1.2, y - h * 0.7);
  ctx.lineTo(x + w * 0.2 + windOffset, y - h * 0.1);
  ctx.lineTo(x + w * 0.7 + windOffset * 0.8, y - h * 0.4);
  ctx.closePath();
  ctx.fill();

  // Front bright leaves (Highlight)
  ctx.fillStyle = '#6CD05E';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - w * 0.4 + windOffset * 0.5, y - h * 0.2);
  ctx.lineTo(x + windOffset * 0.8, y - h * 0.4);
  ctx.lineTo(x + w * 0.4 + windOffset * 0.5, y - h * 0.2);
  ctx.closePath();
  ctx.fill();
}

// Highly detailed tile rendering
function drawTile(
  ctx: CanvasRenderingContext2D,
  tileType: TileType,
  screenX: number,
  screenY: number,
  tileSize: number,
  time: number
) {
  const props = TILE_PROPERTIES[tileType];
  // Base background (fallback)
  if (props) {
    ctx.fillStyle = props.color;
    ctx.fillRect(screenX, screenY, tileSize, tileSize);
  }

  // Adding detailed art based on tile type
  switch (tileType) {
    case TileType.GRASS_SHORT:
    case TileType.SPAWN: {
      // Base vibrant grass
      ctx.fillStyle = '#74C365';
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
      
      // Checkerboard/Texture pattern
      ctx.fillStyle = '#6CB545';
      ctx.fillRect(screenX, screenY, tileSize * 0.5, tileSize * 0.5);
      ctx.fillRect(screenX + tileSize * 0.5, screenY + tileSize * 0.5, tileSize * 0.5, tileSize * 0.5);

      // Small scattered grass blades
      ctx.fillStyle = '#43A03B';
      const bladeW = Math.max(1, tileSize * 0.08);
      ctx.fillRect(screenX + tileSize * 0.2, screenY + tileSize * 0.4, bladeW, tileSize * 0.15);
      ctx.fillRect(screenX + tileSize * 0.7, screenY + tileSize * 0.3, bladeW, tileSize * 0.1);
      ctx.fillRect(screenX + tileSize * 0.5, screenY + tileSize * 0.8, bladeW, tileSize * 0.2);
      break;
    }
    
    case TileType.GRASS_TALL: {
      // Base ground for tall grass
      ctx.fillStyle = '#6CB545';
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
      
      // Wind animation (sine wave based on time and position)
      const windOffset = Math.sin(time / 500 + (screenX + screenY) / tileSize) * (tileSize * 0.05);

      // Draw 4 tufts creating a dense, wild encounter patch
      const tuftSize = tileSize * 0.55;
      drawGrassTuft(ctx, screenX + tileSize * 0.25, screenY + tileSize * 0.45, tuftSize, windOffset);
      drawGrassTuft(ctx, screenX + tileSize * 0.75, screenY + tileSize * 0.45, tuftSize, windOffset);
      drawGrassTuft(ctx, screenX + tileSize * 0.25, screenY + tileSize * 0.95, tuftSize, windOffset);
      drawGrassTuft(ctx, screenX + tileSize * 0.75, screenY + tileSize * 0.95, tuftSize, windOffset);
      break;
    }
    
    case TileType.PATH: {
      ctx.fillStyle = '#D4B886';
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
      
      // Dirt speckles
      ctx.fillStyle = '#C2A36F';
      const dot = Math.max(1, tileSize * 0.1);
      ctx.fillRect(screenX + tileSize * 0.2, screenY + tileSize * 0.2, dot, dot * 2);
      ctx.fillRect(screenX + tileSize * 0.8, screenY + tileSize * 0.5, dot * 1.5, dot);
      ctx.fillRect(screenX + tileSize * 0.4, screenY + tileSize * 0.8, dot, dot);
      ctx.fillRect(screenX + tileSize * 0.6, screenY + tileSize * 0.1, dot, dot);
      break;
    }
    
    case TileType.TREE: {
      ctx.fillStyle = '#74C365'; // grass underneath
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
      
      // Tree shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(screenX + tileSize * 0.5, screenY + tileSize * 0.85, tileSize * 0.4, tileSize * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Trunk
      ctx.fillStyle = '#6E4A2A'; 
      ctx.fillRect(screenX + tileSize * 0.4, screenY + tileSize * 0.5, tileSize * 0.2, tileSize * 0.4);
      ctx.fillStyle = '#4A3018'; // Trunk shade
      ctx.fillRect(screenX + tileSize * 0.4, screenY + tileSize * 0.5, tileSize * 0.05, tileSize * 0.4);

      // Fluffy overlapping canopy circles
      const drawCanopy = (cx: number, cy: number, r: number) => {
        ctx.fillStyle = '#1A4A10'; // outline/shadow
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2A7A1E'; // base green
        ctx.beginPath(); ctx.arc(cx, cy - r*0.1, r * 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#43A03B'; // highlight
        ctx.beginPath(); ctx.arc(cx - r*0.2, cy - r*0.2, r * 0.5, 0, Math.PI * 2); ctx.fill();
      };

      drawCanopy(screenX + tileSize * 0.3, screenY + tileSize * 0.4, tileSize * 0.25);
      drawCanopy(screenX + tileSize * 0.7, screenY + tileSize * 0.4, tileSize * 0.25);
      drawCanopy(screenX + tileSize * 0.5, screenY + tileSize * 0.25, tileSize * 0.3);
      break;
    }
    
    case TileType.WATER: {
      ctx.fillStyle = '#2B82CB'; // Deep water base
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
      
      // Flowing water animation
      const flow = (time / 800 + screenY / tileSize) % Math.PI * 2;
      const waveX1 = Math.sin(flow) * (tileSize * 0.1);
      const waveX2 = Math.cos(flow * 1.5) * (tileSize * 0.1);

      // Light animated ripples
      ctx.fillStyle = '#5EB2FA';
      const wh = Math.max(1, tileSize * 0.06);
      ctx.fillRect(screenX + tileSize * 0.2 + waveX1, screenY + tileSize * 0.2, tileSize * 0.5, wh);
      ctx.fillRect(screenX + tileSize * 0.4 + waveX2, screenY + tileSize * 0.6, tileSize * 0.4, wh);
      
      // Deep spots
      ctx.fillStyle = '#1C63A1';
      ctx.fillRect(screenX + tileSize * 0.1 + waveX2, screenY + tileSize * 0.8, tileSize * 0.3, wh);
      break;
    }
    
    case TileType.ROCK: {
      ctx.fillStyle = '#74C365'; // grass underneath
      ctx.fillRect(screenX, screenY, tileSize, tileSize);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(screenX + tileSize * 0.5, screenY + tileSize * 0.8, tileSize * 0.4, tileSize * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main rocky body (Polygon)
      ctx.fillStyle = '#787878';
      ctx.beginPath();
      ctx.moveTo(screenX + tileSize * 0.2, screenY + tileSize * 0.8);
      ctx.lineTo(screenX + tileSize * 0.15, screenY + tileSize * 0.5);
      ctx.lineTo(screenX + tileSize * 0.4, screenY + tileSize * 0.2);
      ctx.lineTo(screenX + tileSize * 0.7, screenY + tileSize * 0.25);
      ctx.lineTo(screenX + tileSize * 0.85, screenY + tileSize * 0.6);
      ctx.lineTo(screenX + tileSize * 0.7, screenY + tileSize * 0.85);
      ctx.closePath();
      ctx.fill();

      // Rock Highlight
      ctx.fillStyle = '#9A9A9A';
      ctx.beginPath();
      ctx.moveTo(screenX + tileSize * 0.2, screenY + tileSize * 0.7);
      ctx.lineTo(screenX + tileSize * 0.18, screenY + tileSize * 0.5);
      ctx.lineTo(screenX + tileSize * 0.4, screenY + tileSize * 0.25);
      ctx.lineTo(screenX + tileSize * 0.55, screenY + tileSize * 0.4);
      ctx.closePath();
      ctx.fill();

      // Rock Shade
      ctx.fillStyle = '#555555';
      ctx.beginPath();
      ctx.moveTo(screenX + tileSize * 0.7, screenY + tileSize * 0.85);
      ctx.lineTo(screenX + tileSize * 0.85, screenY + tileSize * 0.6);
      ctx.lineTo(screenX + tileSize * 0.6, screenY + tileSize * 0.5);
      ctx.closePath();
      ctx.fill();
      break;
    }
    
    case TileType.FLOWER: {
      ctx.fillStyle = '#74C365';
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
      
      // Gentle flower bobbing
      const bob = Math.sin(time / 400 + (screenX)) * (tileSize * 0.05);
      
      const petalR = Math.max(2, tileSize * 0.12);
      const colors = ['#FF6B8A', '#FFCC00', '#5CE6E6'];
      
      for (let i = 0; i < 3; i++) {
        const fx = screenX + tileSize * (0.25 + i * 0.25);
        const fy = screenY + tileSize * (0.3 + (i % 2) * 0.4) + bob;
        
        // Base shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.arc(fx, fy + petalR, petalR * 1.2, 0, Math.PI * 2); ctx.fill();
        
        // Flower Petals
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.arc(fx - petalR*0.5, fy - petalR*0.5, petalR, 0, Math.PI * 2);
        ctx.arc(fx + petalR*0.5, fy - petalR*0.5, petalR, 0, Math.PI * 2);
        ctx.arc(fx - petalR*0.5, fy + petalR*0.5, petalR, 0, Math.PI * 2);
        ctx.arc(fx + petalR*0.5, fy + petalR*0.5, petalR, 0, Math.PI * 2);
        ctx.fill();
        
        // Center
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(fx, fy, petalR * 0.7, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    
    case TileType.GYM_ENTRANCE: {
      ctx.fillStyle = '#D32F2F'; // Rich red
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
      
      // Pillars / Sides
      ctx.fillStyle = '#B71C1C';
      ctx.fillRect(screenX, screenY, tileSize * 0.15, tileSize);
      ctx.fillRect(screenX + tileSize * 0.85, screenY, tileSize * 0.15, tileSize);
      
      // Doorway
      ctx.fillStyle = '#111111';
      ctx.fillRect(screenX + tileSize * 0.25, screenY + tileSize * 0.3, tileSize * 0.5, tileSize * 0.7);
      
      // Pokeball symbol on top
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(screenX + tileSize / 2, screenY + tileSize * 0.2, tileSize * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#D32F2F';
      ctx.beginPath();
      ctx.arc(screenX + tileSize / 2, screenY + tileSize * 0.2, tileSize * 0.15, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#111111';
      ctx.fillRect(screenX + tileSize * 0.35, screenY + tileSize * 0.18, tileSize * 0.3, tileSize * 0.04);
      break;
    }
  }
}

// Trainer sprite drawing
const TRAINER_COLORS = {
  hat: '#C03028',
  hair: '#2A2A2A',
  skin: '#F8C090',
  shirt: '#3888F8',
  pants: '#385898',
  shoes: '#2A2A2A',
};

function drawTrainer(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  tileSize: number,
  direction: Direction,
  walkFrame: number
) {
  const cx = screenX + tileSize / 2;
  const px = (frac: number) => Math.max(1, Math.round(tileSize * frac));

  const bobY = walkFrame === 0 ? 0 : -px(0.04);
  const facingDown = direction === 'down';
  const facingUp = direction === 'up';
  const facingLeft = direction === 'left';
  const facingRight = direction === 'right';

  // Trainer Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, screenY + tileSize * 0.9, px(0.35), px(0.12), 0, 0, Math.PI * 2);
  ctx.fill();

  const legOffset = walkFrame === 1 ? px(0.08) : walkFrame === 2 ? -px(0.08) : 0;

  // Body (shirt)
  ctx.fillStyle = TRAINER_COLORS.shirt;
  ctx.fillRect(cx - px(0.2), screenY + px(0.35) + bobY, px(0.4), px(0.25));

  // Pants
  ctx.fillStyle = TRAINER_COLORS.pants;
  const legW = px(0.15);
  const legH = px(0.2);
  ctx.fillRect(cx - px(0.18) + legOffset, screenY + px(0.6) + bobY, legW, legH);
  ctx.fillRect(cx + px(0.03) - legOffset, screenY + px(0.6) + bobY, legW, legH);

  // Shoes
  ctx.fillStyle = TRAINER_COLORS.shoes;
  ctx.fillRect(cx - px(0.18) + legOffset, screenY + px(0.78) + bobY, legW, px(0.08));
  ctx.fillRect(cx + px(0.03) - legOffset, screenY + px(0.78) + bobY, legW, px(0.08));

  // Arms
  ctx.fillStyle = TRAINER_COLORS.shirt;
  if (facingDown || facingUp) {
    const armSwing = walkFrame === 1 ? px(0.04) : walkFrame === 2 ? -px(0.04) : 0;
    ctx.fillRect(cx - px(0.28), screenY + px(0.38) + bobY + armSwing, px(0.08), px(0.2));
    ctx.fillRect(cx + px(0.2), screenY + px(0.38) + bobY - armSwing, px(0.08), px(0.2));
  } else {
    const armX = facingLeft ? cx + px(0.15) : cx - px(0.23);
    ctx.fillRect(armX, screenY + px(0.38) + bobY, px(0.1), px(0.22));
  }

  // Head
  ctx.fillStyle = TRAINER_COLORS.skin;
  ctx.fillRect(cx - px(0.18), screenY + px(0.12) + bobY, px(0.36), px(0.28));

  // Hat
  ctx.fillStyle = TRAINER_COLORS.hat;
  if (facingDown) {
    ctx.fillRect(cx - px(0.22), screenY + px(0.04) + bobY, px(0.44), px(0.14));
    ctx.fillRect(cx - px(0.25), screenY + px(0.14) + bobY, px(0.5), px(0.05));
  } else if (facingUp) {
    ctx.fillRect(cx - px(0.22), screenY + px(0.04) + bobY, px(0.44), px(0.16));
  } else {
    const hatX = facingLeft ? cx - px(0.25) : cx - px(0.15);
    ctx.fillRect(hatX, screenY + px(0.04) + bobY, px(0.4), px(0.14));
    const brimX = facingLeft ? cx - px(0.35) : cx - px(0.1);
    ctx.fillRect(brimX, screenY + px(0.14) + bobY, px(0.45), px(0.05));
  }

  // Hair
  ctx.fillStyle = TRAINER_COLORS.hair;
  if (facingDown) {
    ctx.fillRect(cx - px(0.18), screenY + px(0.18) + bobY, px(0.36), px(0.06));
  } else if (facingUp) {
    ctx.fillRect(cx - px(0.18), screenY + px(0.2) + bobY, px(0.36), px(0.12));
  } else {
    const hairX = facingLeft ? cx + px(0.05) : cx - px(0.2);
    ctx.fillRect(hairX, screenY + px(0.18) + bobY, px(0.15), px(0.12));
  }

  // Eyes
  if (facingDown) {
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - px(0.1), screenY + px(0.24) + bobY, px(0.05), px(0.05));
    ctx.fillRect(cx + px(0.05), screenY + px(0.24) + bobY, px(0.05), px(0.05));
  } else if (facingLeft || facingRight) {
    ctx.fillStyle = '#111';
    const eyeX = facingLeft ? cx - px(0.1) : cx + px(0.05);
    ctx.fillRect(eyeX, screenY + px(0.24) + bobY, px(0.05), px(0.05));
  }
}

interface TileMapProps {
  map: TileMapData;
  onEncounter: (pokemonId?: string) => void;
  onGymEntrance: () => void;
  regionName: string;
  regionId: number;
  visiblePokemon: VisiblePokemon[];
  onPokemonRemoved: (phonemeId: string) => void;
}

export default function TileMapComponent({ map, onEncounter, onGymEntrance, regionName, regionId, visiblePokemon, onPokemonRemoved }: TileMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSavedPosition = (): Point => {
    try {
      const saved = sessionStorage.getItem(`explore-pos-${regionId}`);
      if (saved) {
        const pos = JSON.parse(saved);
        if (pos.x >= 0 && pos.y >= 0 && pos.x < map.width && pos.y < map.height) {
          return pos;
        }
      }
    } catch { /* ignore */ }
    return { ...map.spawn };
  };

  const playerPos = useRef<Point>(getSavedPosition());
  const playerDir = useRef<Direction>('down');
  const walkFrame = useRef(0);
  const pathRef = useRef<Point[]>([]);
  const walkingRef = useRef(false);
  const encounterSteps = useRef(0);
  const encounterChance = useRef(0.1);
  const animFrameRef = useRef<number>(0);
  const [showFlash, setShowFlash] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const encounterTriggered = useRef(false);
  const tileSizeRef = useRef(32);
  const pokemonImagesRef = useRef<Record<number, HTMLImageElement>>({});
  const targetedPokemonRef = useRef<string | null>(null);

  // Load Pokemon sprite images
  useEffect(() => {
    visiblePokemon.forEach(vp => {
      if (!pokemonImagesRef.current[vp.pokedexId]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = getOfficialArtwork(vp.pokedexId);
        pokemonImagesRef.current[vp.pokedexId] = img;
      }
    });
  }, [visiblePokemon]);

  const calculateTileSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 48;
    const vw = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    const tilesAcross = 8;
    const size = Math.floor((vw * dpr) / tilesAcross);
    return Math.max(32, Math.min(96, size));
  }, []);

  const walkStep = useCallback(() => {
    if (pathRef.current.length === 0) {
      walkingRef.current = false;
      walkFrame.current = 0;
      return;
    }

    walkingRef.current = true;
    const next = pathRef.current.shift()!;
    const dir = getDirection(playerPos.current, next);
    playerDir.current = dir;
    playerPos.current = { ...next };
    walkFrame.current = walkFrame.current === 1 ? 2 : 1;

    try {
      sessionStorage.setItem(`explore-pos-${regionId}`, JSON.stringify(next));
    } catch { /* ignore */ }

    const tile = getTile(map, next.x, next.y);
    if (tile === TileType.GYM_ENTRANCE) {
      pathRef.current = [];
      walkingRef.current = false;
      walkFrame.current = 0;
      onGymEntrance();
      return;
    }

    // Check if we walked onto a visible Pokemon tile
    const pokemonOnTile = visiblePokemon.find(vp => vp.tileX === next.x && vp.tileY === next.y);
    if (pokemonOnTile) {
      pathRef.current = [];
      walkingRef.current = false;
      walkFrame.current = 0;
      encounterTriggered.current = true;
      encounterSteps.current = 0;
      encounterChance.current = 0.1;
      targetedPokemonRef.current = pokemonOnTile.phonemeId;
      onPokemonRemoved(pokemonOnTile.phonemeId);
      setShowFlash(true);
      setTimeout(() => {
        setShowFlash(false);
        onEncounter(pokemonOnTile.phonemeId);
      }, 400);
      return;
    }

    if (isEncounterTile(map, next.x, next.y)) {
      encounterSteps.current++;
      if (Math.random() < encounterChance.current) {
        pathRef.current = [];
        walkingRef.current = false;
        walkFrame.current = 0;
        encounterTriggered.current = true;
        encounterSteps.current = 0;
        encounterChance.current = 0.1;
        setShowFlash(true);
        setTimeout(() => {
          setShowFlash(false);
          onEncounter();
        }, 400);
        return;
      }
      encounterChance.current = Math.min(0.5, encounterChance.current + 0.05);
    } else {
      encounterSteps.current = 0;
      encounterChance.current = 0.1;
    }

    setTimeout(walkStep, 200);
  }, [map, onEncounter, onGymEntrance, regionId, visiblePokemon, onPokemonRemoved]);

  const handleTap = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (encounterTriggered.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const tileSize = tileSizeRef.current;

    const screenX = (e.clientX - rect.left) * dpr;
    const screenY = (e.clientY - rect.top) * dpr;

    const camX = playerPos.current.x * tileSize - canvas.width / 2 + tileSize / 2;
    const camY = playerPos.current.y * tileSize - canvas.height / 2 + tileSize / 2;
    const maxCamX = map.width * tileSize - canvas.width;
    const maxCamY = map.height * tileSize - canvas.height;
    const clampedCamX = Math.max(0, Math.min(maxCamX, camX));
    const clampedCamY = Math.max(0, Math.min(maxCamY, camY));

    const tileX = Math.floor((screenX + clampedCamX) / tileSize);
    const tileY = Math.floor((screenY + clampedCamY) / tileSize);

    const path = findPath(map, playerPos.current, { x: tileX, y: tileY });
    if (path.length > 0) {
      pathRef.current = path;
      if (!walkingRef.current) {
        walkStep();
      }
    }
  }, [map, walkStep]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    let lastW = 0;
    let lastH = 0;

    const render = (time: number) => {
      const dpr = window.devicePixelRatio || 1;
      const tileSize = calculateTileSize();
      tileSizeRef.current = tileSize;

      const w = container.clientWidth;
      const h = container.clientHeight;
      const canvasW = Math.floor(w * dpr);
      const canvasH = Math.floor(h * dpr);
      
      if (canvasW !== lastW || canvasH !== lastH) {
        canvas.width = canvasW;
        canvas.height = canvasH;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        lastW = canvasW;
        lastH = canvasH;
      }

      ctx.imageSmoothingEnabled = false;

      const camX = playerPos.current.x * tileSize - canvas.width / 2 + tileSize / 2;
      const camY = playerPos.current.y * tileSize - canvas.height / 2 + tileSize / 2;

      const maxCamX = map.width * tileSize - canvas.width;
      const maxCamY = map.height * tileSize - canvas.height;
      const clampedCamX = Math.max(0, Math.min(maxCamX, camX));
      const clampedCamY = Math.max(0, Math.min(maxCamY, camY));

      ctx.fillStyle = '#1A1A2E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const startTileX = Math.max(0, Math.floor(clampedCamX / tileSize));
      const startTileY = Math.max(0, Math.floor(clampedCamY / tileSize));
      const endTileX = Math.min(map.width, Math.ceil((clampedCamX + canvas.width) / tileSize) + 1);
      const endTileY = Math.min(map.height, Math.ceil((clampedCamY + canvas.height) / tileSize) + 1);

      // We pass `time` to drawTile so elements can be animated!
      for (let y = startTileY; y < endTileY; y++) {
        for (let x = startTileX; x < endTileX; x++) {
          const tileType = getTile(map, x, y) as TileType;
          const screenX = x * tileSize - clampedCamX;
          const screenY = y * tileSize - clampedCamY;
          drawTile(ctx, tileType, screenX, screenY, tileSize, time);
        }
      }

      // Draw visible Pokemon on tall grass tiles
      for (const vp of visiblePokemon) {
        if (vp.tileX < startTileX || vp.tileX >= endTileX || vp.tileY < startTileY || vp.tileY >= endTileY) continue;
        const img = pokemonImagesRef.current[vp.pokedexId];
        if (!img || !img.complete || img.naturalWidth === 0) continue;

        const pScreenX = vp.tileX * tileSize - clampedCamX;
        const pScreenY = vp.tileY * tileSize - clampedCamY;

        // Bob animation
        const bobOffset = Math.sin(time * 0.003 + vp.tileX * 7 + vp.tileY * 13) * (tileSize * 0.08);

        // Draw Pokemon sprite peeking out of grass — larger sprite, top ~50% visible
        const spriteSize = tileSize * 1.3;
        const spriteX = pScreenX + (tileSize - spriteSize) / 2;
        const spriteY = pScreenY - tileSize * 0.15 + bobOffset;

        ctx.save();
        // Clip to show only the top portion of the sprite (above the grass line)
        ctx.beginPath();
        ctx.rect(pScreenX - tileSize * 0.2, pScreenY - tileSize * 0.3, tileSize * 1.4, tileSize * 0.85);
        ctx.clip();

        ctx.drawImage(img, spriteX, spriteY, spriteSize, spriteSize);
        ctx.restore();
      }

      const playerScreenX = playerPos.current.x * tileSize - clampedCamX;
      const playerScreenY = playerPos.current.y * tileSize - clampedCamY;
      drawTrainer(ctx, playerScreenX, playerScreenY, tileSize, playerDir.current, walkFrame.current);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [map, calculateTileSize, visiblePokemon]);

  useEffect(() => {
    const timer = setTimeout(() => setShowBanner(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        onClick={handleTap}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer', touchAction: 'none' }}
      />
      {showFlash && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'white',
          animation: 'flashAnim 0.4s ease-out',
          pointerEvents: 'none',
        }} />
      )}
      {showBanner && (
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '12px 32px',
          borderRadius: '8px',
          fontSize: '20px',
          fontFamily: 'var(--font-heading, "Fredoka", sans-serif)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          animation: 'fadeInOut 2.5s ease-in-out',
          pointerEvents: 'none',
        }}>
          {regionName}
        </div>
      )}
      <style>{`
        @keyframes flashAnim {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
          20% { opacity: 1; transform: translateX(-50%) translateY(0); }
          70% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
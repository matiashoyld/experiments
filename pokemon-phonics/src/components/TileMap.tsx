'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { TileType, TILE_PROPERTIES } from '@/data/maps/tile-types';
import { TileMap as TileMapData, Point, findPath, getDirection, Direction, isWalkable, isEncounterTile, getTile } from '@/lib/tile-engine';

const BASE_TILE_SIZE = 16;

// Tile rendering with pixel-art detail
function drawTile(
  ctx: CanvasRenderingContext2D,
  tileType: TileType,
  screenX: number,
  screenY: number,
  tileSize: number
) {
  const props = TILE_PROPERTIES[tileType];
  if (!props) return;

  ctx.fillStyle = props.color;
  ctx.fillRect(screenX, screenY, tileSize, tileSize);

  // Add pixel-art detail per tile type
  switch (tileType) {
    case TileType.GRASS_SHORT: {
      // Small grass blades
      ctx.fillStyle = '#6ab840';
      const bladeW = Math.max(1, tileSize / 8);
      ctx.fillRect(screenX + tileSize * 0.2, screenY + tileSize * 0.5, bladeW, tileSize * 0.2);
      ctx.fillRect(screenX + tileSize * 0.6, screenY + tileSize * 0.3, bladeW, tileSize * 0.2);
      ctx.fillRect(screenX + tileSize * 0.4, screenY + tileSize * 0.7, bladeW, tileSize * 0.15);
      break;
    }
    case TileType.GRASS_TALL: {
      // Darker tall grass tufts
      ctx.fillStyle = '#3a7a1e';
      const bw = Math.max(1, tileSize / 6);
      ctx.fillRect(screenX + tileSize * 0.15, screenY + tileSize * 0.1, bw, tileSize * 0.5);
      ctx.fillRect(screenX + tileSize * 0.35, screenY + tileSize * 0.05, bw, tileSize * 0.55);
      ctx.fillRect(screenX + tileSize * 0.55, screenY + tileSize * 0.15, bw, tileSize * 0.45);
      ctx.fillRect(screenX + tileSize * 0.75, screenY + tileSize * 0.08, bw, tileSize * 0.5);
      // Lighter tips
      ctx.fillStyle = '#5aaa30';
      ctx.fillRect(screenX + tileSize * 0.15, screenY + tileSize * 0.1, bw, bw);
      ctx.fillRect(screenX + tileSize * 0.35, screenY + tileSize * 0.05, bw, bw);
      ctx.fillRect(screenX + tileSize * 0.55, screenY + tileSize * 0.15, bw, bw);
      ctx.fillRect(screenX + tileSize * 0.75, screenY + tileSize * 0.08, bw, bw);
      break;
    }
    case TileType.PATH: {
      // Sandy path with speckles
      ctx.fillStyle = '#c8a878';
      const dot = Math.max(1, tileSize / 8);
      ctx.fillRect(screenX + tileSize * 0.2, screenY + tileSize * 0.3, dot, dot);
      ctx.fillRect(screenX + tileSize * 0.7, screenY + tileSize * 0.6, dot, dot);
      ctx.fillRect(screenX + tileSize * 0.5, screenY + tileSize * 0.8, dot, dot);
      break;
    }
    case TileType.TREE: {
      // Tree trunk + canopy
      ctx.fillStyle = '#7a5a30'; // trunk
      const trunkW = tileSize * 0.25;
      const trunkH = tileSize * 0.4;
      ctx.fillRect(screenX + (tileSize - trunkW) / 2, screenY + tileSize * 0.6, trunkW, trunkH);
      ctx.fillStyle = '#1a4a10'; // dark canopy
      ctx.beginPath();
      ctx.arc(screenX + tileSize / 2, screenY + tileSize * 0.4, tileSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2d6a1e'; // light canopy highlight
      ctx.beginPath();
      ctx.arc(screenX + tileSize * 0.4, screenY + tileSize * 0.35, tileSize * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case TileType.WATER: {
      // Water with wave lines
      ctx.fillStyle = '#68b8f8';
      const ww = tileSize * 0.6;
      const wh = Math.max(1, tileSize / 8);
      ctx.fillRect(screenX + (tileSize - ww) / 2, screenY + tileSize * 0.3, ww, wh);
      ctx.fillRect(screenX + (tileSize - ww) / 2 + tileSize * 0.1, screenY + tileSize * 0.6, ww * 0.8, wh);
      break;
    }
    case TileType.ROCK: {
      // Rocky boulder
      ctx.fillStyle = '#999999';
      ctx.beginPath();
      ctx.arc(screenX + tileSize / 2, screenY + tileSize * 0.55, tileSize * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#aaaaaa';
      ctx.beginPath();
      ctx.arc(screenX + tileSize * 0.4, screenY + tileSize * 0.45, tileSize * 0.15, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case TileType.FLOWER: {
      // Grass base + flowers
      ctx.fillStyle = '#7ec850';
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
      const petalR = Math.max(1, tileSize / 8);
      const colors = ['#ff6b8a', '#ffcc00', '#ff8855', '#cc66ff'];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = colors[i % colors.length];
        const fx = screenX + tileSize * (0.2 + i * 0.3);
        const fy = screenY + tileSize * (0.3 + (i % 2) * 0.3);
        ctx.beginPath();
        ctx.arc(fx, fy, petalR * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffff88';
        ctx.beginPath();
        ctx.arc(fx, fy, petalR * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case TileType.SAND: {
      ctx.fillStyle = '#e8d090';
      const sdot = Math.max(1, tileSize / 10);
      ctx.fillRect(screenX + tileSize * 0.3, screenY + tileSize * 0.4, sdot, sdot);
      ctx.fillRect(screenX + tileSize * 0.7, screenY + tileSize * 0.7, sdot, sdot);
      break;
    }
    case TileType.CAVE_FLOOR: {
      ctx.fillStyle = '#5a4a3e';
      const cdot = Math.max(1, tileSize / 8);
      ctx.fillRect(screenX + tileSize * 0.2, screenY + tileSize * 0.5, cdot, cdot);
      ctx.fillRect(screenX + tileSize * 0.6, screenY + tileSize * 0.3, cdot, cdot);
      break;
    }
    case TileType.CAVE_WALL: {
      ctx.fillStyle = '#4a3828';
      ctx.fillRect(screenX, screenY + tileSize * 0.8, tileSize, tileSize * 0.2);
      ctx.fillStyle = '#5a4838';
      ctx.fillRect(screenX + tileSize * 0.1, screenY + tileSize * 0.1, tileSize * 0.3, tileSize * 0.3);
      break;
    }
    case TileType.SPAWN: {
      // Looks like short grass
      ctx.fillStyle = '#7ec850';
      ctx.fillRect(screenX, screenY, tileSize, tileSize);
      ctx.fillStyle = '#6ab840';
      const sb = Math.max(1, tileSize / 8);
      ctx.fillRect(screenX + tileSize * 0.3, screenY + tileSize * 0.5, sb, tileSize * 0.2);
      ctx.fillRect(screenX + tileSize * 0.7, screenY + tileSize * 0.4, sb, tileSize * 0.15);
      break;
    }
    case TileType.GYM_ENTRANCE: {
      // Red gym door tiles
      ctx.fillStyle = '#e03028';
      ctx.fillRect(screenX + tileSize * 0.1, screenY + tileSize * 0.1, tileSize * 0.8, tileSize * 0.8);
      ctx.fillStyle = '#ff5048';
      ctx.fillRect(screenX + tileSize * 0.2, screenY + tileSize * 0.15, tileSize * 0.6, tileSize * 0.3);
      // Pokeball symbol
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(screenX + tileSize / 2, screenY + tileSize / 2, tileSize * 0.15, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

// Trainer sprite drawing
const TRAINER_COLORS = {
  hat: '#c03028',
  hair: '#2a2a2a',
  skin: '#f8c090',
  shirt: '#3888f8',
  pants: '#385898',
  shoes: '#2a2a2a',
};

function drawTrainer(
  ctx: CanvasRenderingContext2D,
  screenX: number,
  screenY: number,
  tileSize: number,
  direction: Direction,
  walkFrame: number // 0=stand, 1=left, 2=right
) {
  const cx = screenX + tileSize / 2;
  const px = (frac: number) => Math.max(1, Math.round(tileSize * frac));

  // Slight bob on walk frames
  const bobY = walkFrame === 0 ? 0 : -px(0.03);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(cx, screenY + tileSize * 0.92, px(0.3), px(0.08), 0, 0, Math.PI * 2);
  ctx.fill();

  const facingDown = direction === 'down';
  const facingUp = direction === 'up';
  const facingLeft = direction === 'left';
  const facingRight = direction === 'right';

  // Leg offset for walk animation
  const legOffset = walkFrame === 1 ? px(0.06) : walkFrame === 2 ? -px(0.06) : 0;

  // Body (shirt)
  ctx.fillStyle = TRAINER_COLORS.shirt;
  ctx.fillRect(cx - px(0.2), screenY + px(0.35) + bobY, px(0.4), px(0.25));

  // Pants
  ctx.fillStyle = TRAINER_COLORS.pants;
  const legW = px(0.15);
  const legH = px(0.2);
  // Left leg
  ctx.fillRect(cx - px(0.18) + legOffset, screenY + px(0.6) + bobY, legW, legH);
  // Right leg
  ctx.fillRect(cx + px(0.03) - legOffset, screenY + px(0.6) + bobY, legW, legH);

  // Shoes
  ctx.fillStyle = TRAINER_COLORS.shoes;
  ctx.fillRect(cx - px(0.18) + legOffset, screenY + px(0.78) + bobY, legW, px(0.06));
  ctx.fillRect(cx + px(0.03) - legOffset, screenY + px(0.78) + bobY, legW, px(0.06));

  // Arms
  ctx.fillStyle = TRAINER_COLORS.shirt;
  if (facingDown || facingUp) {
    // Arms at sides
    const armSwing = walkFrame === 1 ? px(0.03) : walkFrame === 2 ? -px(0.03) : 0;
    ctx.fillRect(cx - px(0.28), screenY + px(0.38) + bobY + armSwing, px(0.08), px(0.2));
    ctx.fillRect(cx + px(0.2), screenY + px(0.38) + bobY - armSwing, px(0.08), px(0.2));
  } else {
    // One arm visible
    const armX = facingLeft ? cx + px(0.15) : cx - px(0.23);
    ctx.fillRect(armX, screenY + px(0.38) + bobY, px(0.08), px(0.22));
  }

  // Head
  ctx.fillStyle = TRAINER_COLORS.skin;
  ctx.fillRect(cx - px(0.15), screenY + px(0.12) + bobY, px(0.3), px(0.25));

  // Hat
  ctx.fillStyle = TRAINER_COLORS.hat;
  if (facingDown) {
    ctx.fillRect(cx - px(0.2), screenY + px(0.06) + bobY, px(0.4), px(0.12));
    // Hat brim
    ctx.fillRect(cx - px(0.22), screenY + px(0.15) + bobY, px(0.44), px(0.04));
  } else if (facingUp) {
    ctx.fillRect(cx - px(0.2), screenY + px(0.06) + bobY, px(0.4), px(0.14));
  } else {
    // Side view hat
    const hatX = facingLeft ? cx - px(0.25) : cx - px(0.15);
    ctx.fillRect(hatX, screenY + px(0.06) + bobY, px(0.4), px(0.12));
    // Brim
    const brimX = facingLeft ? cx - px(0.3) : cx - px(0.1);
    ctx.fillRect(brimX, screenY + px(0.15) + bobY, px(0.4), px(0.04));
  }

  // Hair
  ctx.fillStyle = TRAINER_COLORS.hair;
  if (facingDown) {
    ctx.fillRect(cx - px(0.15), screenY + px(0.15) + bobY, px(0.3), px(0.05));
  } else if (facingUp) {
    ctx.fillRect(cx - px(0.15), screenY + px(0.18) + bobY, px(0.3), px(0.12));
  } else {
    const hairX = facingLeft ? cx + px(0.05) : cx - px(0.2);
    ctx.fillRect(hairX, screenY + px(0.15) + bobY, px(0.15), px(0.12));
  }

  // Eyes (only when facing down or sides)
  if (facingDown) {
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(cx - px(0.08), screenY + px(0.22) + bobY, px(0.04), px(0.04));
    ctx.fillRect(cx + px(0.05), screenY + px(0.22) + bobY, px(0.04), px(0.04));
  } else if (facingLeft || facingRight) {
    ctx.fillStyle = '#2a2a2a';
    const eyeX = facingLeft ? cx - px(0.08) : cx + px(0.05);
    ctx.fillRect(eyeX, screenY + px(0.22) + bobY, px(0.04), px(0.04));
  }
}

interface TileMapProps {
  map: TileMapData;
  onEncounter: () => void;
  onGymEntrance: () => void;
  regionName: string;
  regionId: number;
}

export default function TileMapComponent({ map, onEncounter, onGymEntrance, regionName, regionId }: TileMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Restore player position from sessionStorage (survives encounter round-trips)
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

  // Game state refs (avoid re-renders)
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

  // Calculate tile size to fit viewport — zoomed in to show ~8 tiles across
  const calculateTileSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 48;
    const vw = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    // Show about 8 tiles across the viewport for a zoomed-in feel
    const tilesAcross = 8;
    const size = Math.floor((vw * dpr) / tilesAcross);
    return Math.max(32, Math.min(96, size));
  }, []);

  // Walk one step along the path
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

    // Save position for encounter round-trips
    try {
      sessionStorage.setItem(`explore-pos-${regionId}`, JSON.stringify(next));
    } catch { /* ignore */ }

    // Check for gym entrance
    const tile = getTile(map, next.x, next.y);
    if (tile === TileType.GYM_ENTRANCE) {
      pathRef.current = [];
      walkingRef.current = false;
      walkFrame.current = 0;
      onGymEntrance();
      return;
    }

    // Check for encounter
    if (isEncounterTile(map, next.x, next.y)) {
      encounterSteps.current++;
      if (Math.random() < encounterChance.current) {
        // Trigger encounter!
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
      // Increase chance with each step on encounter tile
      encounterChance.current = Math.min(0.5, encounterChance.current + 0.05);
    } else {
      // Reset encounter chance when not on encounter tile
      encounterSteps.current = 0;
      encounterChance.current = 0.1;
    }

    // Schedule next step
    setTimeout(walkStep, 200);
  }, [map, onEncounter, onGymEntrance, regionId]);

  // Handle tap on canvas
  const handleTap = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (encounterTriggered.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const tileSize = tileSizeRef.current;

    // Screen coordinates relative to canvas (in canvas pixel space)
    const screenX = (e.clientX - rect.left) * dpr;
    const screenY = (e.clientY - rect.top) * dpr;

    // Camera offset (must match the clamped camera in the render loop)
    const camX = playerPos.current.x * tileSize - canvas.width / 2 + tileSize / 2;
    const camY = playerPos.current.y * tileSize - canvas.height / 2 + tileSize / 2;
    const maxCamX = map.width * tileSize - canvas.width;
    const maxCamY = map.height * tileSize - canvas.height;
    const clampedCamX = Math.max(0, Math.min(maxCamX, camX));
    const clampedCamY = Math.max(0, Math.min(maxCamY, camY));

    // Convert to tile coordinates
    const tileX = Math.floor((screenX + clampedCamX) / tileSize);
    const tileY = Math.floor((screenY + clampedCamY) / tileSize);

    // Find path
    const path = findPath(map, playerPos.current, { x: tileX, y: tileY });
    if (path.length > 0) {
      pathRef.current = path;
      if (!walkingRef.current) {
        walkStep();
      }
    }
  }, [map, walkStep]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;

    let lastW = 0;
    let lastH = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const tileSize = calculateTileSize();
      tileSizeRef.current = tileSize;

      // Size canvas to container (only when size changes to avoid flicker)
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

      // Disable image smoothing for pixel art
      ctx.imageSmoothingEnabled = false;

      // Camera (centered on player)
      const camX = playerPos.current.x * tileSize - canvas.width / 2 + tileSize / 2;
      const camY = playerPos.current.y * tileSize - canvas.height / 2 + tileSize / 2;

      // Clamp camera
      const maxCamX = map.width * tileSize - canvas.width;
      const maxCamY = map.height * tileSize - canvas.height;
      const clampedCamX = Math.max(0, Math.min(maxCamX, camX));
      const clampedCamY = Math.max(0, Math.min(maxCamY, camY));

      // Clear
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate visible tile range
      const startTileX = Math.max(0, Math.floor(clampedCamX / tileSize));
      const startTileY = Math.max(0, Math.floor(clampedCamY / tileSize));
      const endTileX = Math.min(map.width, Math.ceil((clampedCamX + canvas.width) / tileSize) + 1);
      const endTileY = Math.min(map.height, Math.ceil((clampedCamY + canvas.height) / tileSize) + 1);

      // Draw tiles
      for (let y = startTileY; y < endTileY; y++) {
        for (let x = startTileX; x < endTileX; x++) {
          const tileType = getTile(map, x, y) as TileType;
          const screenX = x * tileSize - clampedCamX;
          const screenY = y * tileSize - clampedCamY;
          drawTile(ctx, tileType, screenX, screenY, tileSize);
        }
      }

      // Draw player
      const playerScreenX = playerPos.current.x * tileSize - clampedCamX;
      const playerScreenY = playerPos.current.y * tileSize - clampedCamY;
      drawTrainer(ctx, playerScreenX, playerScreenY, tileSize, playerDir.current, walkFrame.current);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [map, calculateTileSize]);

  // Hide banner after 2 seconds
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

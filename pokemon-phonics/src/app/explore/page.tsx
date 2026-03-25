'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import TileMapComponent, { VisiblePokemon } from '@/components/TileMap';
import { loadMap, TileMap as TileMapData } from '@/lib/tile-engine';
import { TileType } from '@/data/maps/tile-types';
import { REGIONS } from '@/data/regions';
import { getPhonemesBySet } from '@/data/phonemes';
import { useGameState } from '@/hooks/useGameState';
import { ArrowLeft } from 'lucide-react';
import { PALLET_MEADOW } from '@/data/maps/region-1';
import { VIRIDIAN_WOODS } from '@/data/maps/region-2';
import { PEWTER_MOUNTAINS } from '@/data/maps/region-3';
import { CERULEAN_CAVES } from '@/data/maps/region-4';
import { VERMILION_COAST } from '@/data/maps/region-5';
import { LAVENDER_FIELDS } from '@/data/maps/region-6';
import { SAFFRON_CITY } from '@/data/maps/region-7';
import './explore.css';

const MAP_DATA: Record<number, number[][]> = {
  1: PALLET_MEADOW,
  2: VIRIDIAN_WOODS,
  3: PEWTER_MOUNTAINS,
  4: CERULEAN_CAVES,
  5: VERMILION_COAST,
  6: LAVENDER_FIELDS,
  7: SAFFRON_CITY,
};

function findTallGrassTiles(tileMap: TileMapData, spawnPoint: { x: number; y: number }): { x: number; y: number }[] {
  const tiles: { x: number; y: number }[] = [];
  for (let y = 0; y < tileMap.height; y++) {
    for (let x = 0; x < tileMap.width; x++) {
      if (tileMap.tiles[y][x] === TileType.GRASS_TALL) {
        const dist = Math.abs(x - spawnPoint.x) + Math.abs(y - spawnPoint.y);
        if (dist >= 3) {
          tiles.push({ x, y });
        }
      }
    }
  }
  return tiles;
}

function generateVisiblePokemon(
  regionSet: number,
  tileMap: TileMapData,
  pokemonStates: Record<string, { caught: boolean }>,
  existingPositions: Set<string>,
  count: number,
): VisiblePokemon[] {
  const phonemes = getPhonemesBySet(regionSet);
  const grassTiles = findTallGrassTiles(tileMap, tileMap.spawn);

  // Separate uncaught (priority 80%) and caught (20%)
  const uncaught = phonemes.filter(p => !pokemonStates[p.id]?.caught);
  const caught = phonemes.filter(p => pokemonStates[p.id]?.caught);

  // Build candidate pool with weighted selection
  const candidates: typeof phonemes = [];
  for (let i = 0; i < count; i++) {
    const pool = uncaught.length > 0 && Math.random() < 0.8 ? uncaught : caught.length > 0 ? caught : uncaught.length > 0 ? uncaught : phonemes;
    if (pool.length === 0) break;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    // Allow same species on different tiles, but avoid duplicating same phoneme too much
    candidates.push(pick);
  }

  // Pick random grass tiles that aren't already used
  const availableTiles = grassTiles.filter(t => !existingPositions.has(`${t.x},${t.y}`));
  const shuffled = [...availableTiles].sort(() => Math.random() - 0.5);

  const result: VisiblePokemon[] = [];
  for (let i = 0; i < Math.min(candidates.length, shuffled.length); i++) {
    const phoneme = candidates[i];
    const tile = shuffled[i];
    result.push({
      phonemeId: phoneme.id,
      tileX: tile.x,
      tileY: tile.y,
      pokedexId: phoneme.pokemon.evolutionLine.stage1.id,
      pokemonName: phoneme.pokemon.name,
    });
  }
  return result;
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const regionId = parseInt(searchParams.get('region') || '1', 10);
  const { state, loaded } = useGameState();

  const region = REGIONS.find(r => r.id === regionId);
  const mapTiles = MAP_DATA[regionId];

  const tileMap = useMemo(() => {
    if (!mapTiles) return null;
    return loadMap(mapTiles);
  }, [mapTiles]);

  const [visiblePokemon, setVisiblePokemon] = useState<VisiblePokemon[]>([]);
  const respawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  // Initialize visible Pokemon when map and game state are ready
  useEffect(() => {
    if (!tileMap || !loaded || !state || !region || initializedRef.current) return;
    initializedRef.current = true;
    const pokemon = generateVisiblePokemon(region.set, tileMap, state.pokemon, new Set(), 4);
    setVisiblePokemon(pokemon);
  }, [tileMap, loaded, state, region]);

  const handlePokemonRemoved = useCallback((phonemeId: string) => {
    setVisiblePokemon(prev => prev.filter(vp => vp.phonemeId !== phonemeId));

    // Respawn a new Pokemon after 10 seconds
    if (respawnTimerRef.current) clearTimeout(respawnTimerRef.current);
    respawnTimerRef.current = setTimeout(() => {
      if (!tileMap || !state || !region) return;
      setVisiblePokemon(prev => {
        const usedPositions = new Set(prev.map(vp => `${vp.tileX},${vp.tileY}`));
        const newPokemon = generateVisiblePokemon(region.set, tileMap, state.pokemon, usedPositions, 1);
        return [...prev, ...newPokemon];
      });
    }, 10000);
  }, [tileMap, state, region]);

  const handleEncounter = useCallback((pokemonId?: string) => {
    const params = new URLSearchParams({ region: String(regionId), from: 'explore' });
    if (pokemonId) params.set('pokemonId', pokemonId);
    router.push(`/encounter?${params.toString()}`);
  }, [router, regionId]);

  const handleGymEntrance = useCallback(() => {
    router.push(`/battle?gym=${regionId}`);
  }, [router, regionId]);

  const handleBack = useCallback(() => {
    router.push('/map');
  }, [router]);

  // Cleanup respawn timer
  useEffect(() => {
    return () => {
      if (respawnTimerRef.current) clearTimeout(respawnTimerRef.current);
    };
  }, []);

  if (!region || !tileMap) {
    return (
      <div className="explore-container">
        <p>Region not found</p>
        <button onClick={handleBack}>Back to Map</button>
      </div>
    );
  }

  return (
    <div className="explore-container">
      <TileMapComponent
        map={tileMap}
        onEncounter={handleEncounter}
        onGymEntrance={handleGymEntrance}
        regionName={region.name}
        regionId={regionId}
        visiblePokemon={visiblePokemon}
        onPokemonRemoved={handlePokemonRemoved}
      />
      <button className="explore-back-btn" onClick={handleBack}>
        <ArrowLeft size={16} strokeWidth={3} /> Map
      </button>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="explore-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}

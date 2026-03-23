'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useCallback, useMemo } from 'react';
import TileMapComponent from '@/components/TileMap';
import { loadMap } from '@/lib/tile-engine';
import { REGIONS } from '@/data/regions';
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

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const regionId = parseInt(searchParams.get('region') || '1', 10);

  const region = REGIONS.find(r => r.id === regionId);
  const mapTiles = MAP_DATA[regionId];

  const tileMap = useMemo(() => {
    if (!mapTiles) return null;
    return loadMap(mapTiles);
  }, [mapTiles]);

  const handleEncounter = useCallback(() => {
    router.push(`/encounter?region=${regionId}&from=explore`);
  }, [router, regionId]);

  const handleGymEntrance = useCallback(() => {
    router.push(`/battle?gym=${regionId}`);
  }, [router, regionId]);

  const handleBack = useCallback(() => {
    router.push('/map');
  }, [router]);

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
      />
      <button className="explore-back-btn" onClick={handleBack}>
        &larr; Map
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

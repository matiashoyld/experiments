'use client';

import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { useMusic } from '@/hooks/useMusic';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { REGIONS } from '@/data/regions';
import { getPhonemesBySet, ALL_PHONEMES } from '@/data/phonemes';
import PokemonSprite from '@/components/PokemonSprite';
import SessionWarning from '@/components/SessionWarning';
import SessionLock from '@/components/SessionLock';

export default function WorldMap() {
  const router = useRouter();
  const { state, loaded, endSession, updateState } = useGameState();
  const { speak, narrate } = useAudio();
  const { toggle: toggleMusic } = useMusic('map', state?.settings?.soundEnabled !== false);

  const sessionTimer = useSessionTimer({
    warningMinutes: state?.settings.sessionLengthMinutes ?? 8,
    lockMinutes: (state?.settings.sessionLengthMinutes ?? 8) + 2,
    startTime: state?.session.startTime ?? null,
    onWarning: () => narrate.ui.tired(),
  });

  if (!loaded || !state) {
    return <div className="screen"><p>Loading...</p></div>;
  }

  const handleRegionTap = async (region: typeof REGIONS[0]) => {
    const isUnlocked = region.set <= state.currentSet;
    if (!isUnlocked) {
      await speak(`${region.name} is locked. Keep training to unlock it!`);
      return;
    }
    await speak(`Let's explore ${region.name}!`);
    router.push(`/explore?region=${region.id}`);
  };

  // Count caught Pokemon per region
  const getCaughtCount = (set: number) => {
    const phonemes = getPhonemesBySet(set);
    return phonemes.filter(p => state.pokemon[p.id]?.caught).length;
  };

  const getTotalCount = (set: number) => getPhonemesBySet(set).length;

  // Get a display Pokemon for each region (first caught one, or first in set)
  const getRegionPokemon = (set: number) => {
    const phonemes = getPhonemesBySet(set);
    const caught = phonemes.find(p => state.pokemon[p.id]?.caught);
    return caught || phonemes[0];
  };

  const hasBadge = (regionId: number) => state.badges.includes(`gym-${regionId}`);

  const handleParentUnlock = () => {
    sessionTimer.unlockSession();
    // Reset session timer by updating startTime to now
    updateState(prev => ({
      ...prev,
      session: { ...prev.session, startTime: Date.now() },
    }));
  };

  return (
    <div className="screen map-screen">
      {/* Session lock overlay */}
      {sessionTimer.isLocked && state && (
        <SessionLock gameState={state} onParentUnlock={handleParentUnlock} />
      )}

      {/* Session warning toast */}
      {sessionTimer.warningShown && !sessionTimer.isLocked && (
        <SessionWarning
          minutesElapsed={sessionTimer.minutesElapsed}
          warningMinutes={state.settings.sessionLengthMinutes}
          lockMinutes={state.settings.sessionLengthMinutes + 2}
        />
      )}

      {/* Header */}
      <div className="map-header">
        <div className="map-header-row">
          <h2 className="map-title">Pokemon Phonics World</h2>
          <button className="map-music-toggle" onClick={toggleMusic} title="Toggle music">
            {state.settings.soundEnabled !== false ? '🔊' : '🔇'}
          </button>
        </div>
        <div className="map-badges">
          {state.session.streak >= 3 && (
            <span className="map-streak">🔥 {state.session.streak}</span>
          )}
          {state.badges.length > 0 && (
            <span className="map-badge-count">{state.badges.length} badges</span>
          )}
        </div>
      </div>

      {/* Map grid */}
      <div className="map-grid">
        {REGIONS.filter(r => r.phase === 1).map((region) => {
          const isUnlocked = region.set <= state.currentSet;
          const isCurrent = region.set === state.currentSet;
          const isCompleted = hasBadge(region.id);
          const caught = getCaughtCount(region.set);
          const total = getTotalCount(region.set);
          const pokemon = getRegionPokemon(region.set);
          const gymReady = isUnlocked && caught === total && !isCompleted;

          return (
            <button
              key={region.id}
              className={`map-region ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${gymReady ? 'gym-ready' : ''}`}
              onClick={() => gymReady ? router.push(`/battle?gym=${region.id}`) : handleRegionTap(region)}
              disabled={!isUnlocked}
              aria-label={`${region.name}${isUnlocked ? '' : ' (locked)'}`}
            >
              {/* Pokemon sprite */}
              <div className="region-pokemon">
                {pokemon && (
                  <PokemonSprite
                    pokedexId={pokemon.pokemon.id}
                    name={pokemon.pokemon.name}
                    size={72}
                    silhouette={!isUnlocked}
                  />
                )}
              </div>

              {/* Region info */}
              <div className="region-info">
                <span className="region-name">{region.name}</span>
                {isUnlocked && (
                  <span className="region-progress">{caught}/{total} caught</span>
                )}
              </div>

              {/* Badge indicator */}
              {isCompleted && (
                <div className="region-badge" style={{ backgroundColor: region.badgeColor }}>
                  ★
                </div>
              )}

              {/* Current indicator */}
              {isCurrent && !isCompleted && (
                <div className="region-current-dot" />
              )}

              {/* Gym ready indicator */}
              {gymReady && (
                <div className="region-gym-ready">⚔️ Gym Battle!</div>
              )}

              {/* Lock icon */}
              {!isUnlocked && (
                <div className="region-lock">🔒</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Phase 2 preview */}
      {state.currentSet > 7 && (
        <div className="map-phase2">
          <h3>Phase 2 — New Sounds!</h3>
          <div className="map-grid">
            {REGIONS.filter(r => r.phase === 2).map((region) => {
              const isUnlocked = region.set <= state.currentSet;
              const pokemon = getRegionPokemon(region.set);

              return (
                <button
                  key={region.id}
                  className={`map-region ${isUnlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => handleRegionTap(region)}
                  disabled={!isUnlocked}
                >
                  <div className="region-pokemon">
                    {pokemon && (
                      <PokemonSprite
                        pokedexId={pokemon.pokemon.id}
                        name={pokemon.pokemon.name}
                        size={72}
                        silhouette={!isUnlocked}
                      />
                    )}
                  </div>
                  <div className="region-info">
                    <span className="region-name">{region.name}</span>
                  </div>
                  {!isUnlocked && <div className="region-lock">🔒</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="map-nav">
        <button className="btn btn-secondary" onClick={() => router.push('/pokedex')}>
          Pokedex
        </button>
        <button className="btn btn-success" onClick={() => router.push('/train')}>
          Train
        </button>
        <button className="btn btn-gold" onClick={() => router.push('/')}>
          Home
        </button>
      </div>

      <style jsx>{`
        .map-screen {
          background: linear-gradient(180deg, #87CEEB 0%, #B3E5FC 20%, #C8E6C9 50%, #A5D6A7 100%);
          justify-content: flex-start;
          padding-top: 20px;
          gap: 16px;
        }

        .map-header {
          text-align: center;
          width: 100%;
        }

        .map-header-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .map-music-toggle {
          background: rgba(255,255,255,0.4);
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          font-family: inherit;
        }

        .map-music-toggle:active {
          background: rgba(255,255,255,0.6);
        }

        .map-title {
          color: white;
          text-shadow: 2px 2px 0 rgba(0,0,0,0.15);
        }

        .map-badges {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .map-streak {
          background: linear-gradient(135deg, #FF6B00, #FF9800);
          color: white;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          animation: flamePulse 1.5s ease-in-out infinite;
        }

        @keyframes flamePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .map-badge-count {
          background: var(--pokemon-yellow);
          color: var(--text-dark);
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .map-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          width: 100%;
          max-width: 600px;
        }

        .map-region {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          border-radius: var(--radius);
          border: 3px solid transparent;
          background: rgba(255,255,255,0.85);
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: transform 0.15s, border-color 0.2s;
          position: relative;
          min-height: 140px;
          justify-content: center;
          gap: 4px;
          font-family: inherit;
        }

        .map-region:active:not(:disabled) {
          transform: scale(0.96);
        }

        .map-region.locked {
          background: rgba(200,200,200,0.5);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .map-region.current {
          border-color: var(--pokemon-yellow);
          animation: currentGlow 2s ease-in-out infinite;
        }

        @keyframes currentGlow {
          0%, 100% { box-shadow: var(--shadow), 0 0 0 0 rgba(255,215,0,0.4); }
          50% { box-shadow: var(--shadow), 0 0 0 6px rgba(255,215,0,0.2); }
        }

        .map-region.completed {
          border-color: var(--success);
          background: rgba(232,245,233,0.9);
        }

        .region-pokemon {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .region-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .region-name {
          font-size: 0.85rem;
          font-weight: 600;
          text-align: center;
          line-height: 1.2;
        }

        .region-progress {
          font-size: 0.75rem;
          color: #666;
        }

        .region-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .region-current-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--pokemon-yellow);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .map-region.gym-ready {
          border-color: var(--pokemon-red);
          animation: gymPulse 1.5s ease-in-out infinite;
        }

        @keyframes gymPulse {
          0%, 100% { box-shadow: var(--shadow), 0 0 0 0 rgba(255, 28, 28, 0.4); }
          50% { box-shadow: var(--shadow), 0 0 0 6px rgba(255, 28, 28, 0.2); }
        }

        .region-gym-ready {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--pokemon-red);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 999px;
          white-space: nowrap;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .region-lock {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          opacity: 0.6;
        }

        .map-nav {
          display: flex;
          gap: 12px;
          margin-top: auto;
          padding-bottom: 12px;
        }

        .map-phase2 {
          width: 100%;
          max-width: 600px;
          text-align: center;
        }

        .map-phase2 h3 {
          color: white;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}

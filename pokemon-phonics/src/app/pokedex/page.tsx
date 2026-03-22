'use client';

import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { ALL_PHONEMES } from '@/data/phonemes';
import PokemonSprite from '@/components/PokemonSprite';

export default function Pokedex() {
  const router = useRouter();
  const { state, loaded } = useGameState();

  if (!loaded || !state) {
    return <div className="screen"><p>Loading...</p></div>;
  }

  const caughtCount = ALL_PHONEMES.filter(p => state.pokemon[p.id]?.caught).length;

  return (
    <div className="screen pokedex-screen">
      <div className="pokedex-header">
        <button className="btn btn-secondary" onClick={() => router.push('/map')}>
          ← Map
        </button>
        <h2>Pokedex</h2>
        <span className="pokedex-count">{caughtCount}/{ALL_PHONEMES.length}</span>
      </div>

      <div className="pokedex-grid">
        {ALL_PHONEMES.map((phoneme) => {
          const caught = state.pokemon[phoneme.id]?.caught;
          const pokemonState = state.pokemon[phoneme.id];
          const stage = pokemonState?.stage || 1;
          const evoLine = phoneme.pokemon.evolutionLine;
          const displayPokemon = stage === 3 ? evoLine.stage3 : stage === 2 ? evoLine.stage2 : evoLine.stage1;

          return (
            <div
              key={phoneme.id}
              className={`pokedex-entry ${caught ? 'caught' : 'uncaught'}`}
              onClick={() => caught && router.push(`/train?pokemon=${phoneme.id}`)}
              style={{ cursor: caught ? 'pointer' : 'default' }}
            >
              <PokemonSprite
                pokedexId={displayPokemon.id}
                name={displayPokemon.name}
                size={64}
                silhouette={!caught}
                variant={pokemonState?.isShiny ? 'shiny' : 'official'}
              />
              <span className="pokedex-entry-name">
                {caught ? displayPokemon.name : '???'}
              </span>
              {caught && (
                <span className="pokedex-entry-sound">{phoneme.grapheme}</span>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .pokedex-screen {
          background: linear-gradient(180deg, #C62828 0%, #D32F2F 10%, #FAFAFA 10%, #FAFAFA 100%);
          justify-content: flex-start;
          padding-top: 16px;
          gap: 12px;
        }

        .pokedex-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 600px;
        }

        .pokedex-header h2 {
          color: white;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.2);
        }

        .pokedex-count {
          background: white;
          color: var(--pokemon-red);
          padding: 6px 14px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 1rem;
        }

        .pokedex-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px;
          width: 100%;
          max-width: 600px;
          overflow-y: auto;
          padding-bottom: 24px;
        }

        .pokedex-entry {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          border-radius: var(--radius-sm);
          background: white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .pokedex-entry.uncaught {
          background: #F5F5F5;
        }

        .pokedex-entry-name {
          font-size: 0.7rem;
          font-weight: 600;
          text-align: center;
          line-height: 1.1;
        }

        .pokedex-entry-sound {
          font-size: 1rem;
          font-weight: 700;
          color: var(--pokemon-blue);
        }
      `}</style>
    </div>
  );
}

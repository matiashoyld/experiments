'use client';

import { useState } from 'react';
import PokemonSprite from './PokemonSprite';
import { ALL_PHONEMES } from '@/data/phonemes';
import { GameState } from '@/hooks/useGameState';

interface SessionLockProps {
  gameState: GameState;
  onParentUnlock: () => void;
}

export default function SessionLock({ gameState, onParentUnlock }: SessionLockProps) {
  const [showParentGate, setShowParentGate] = useState(false);
  const [answer, setAnswer] = useState('');
  // Simple math problem as parent gate
  const [problem] = useState(() => {
    const a = Math.floor(Math.random() * 20) + 10;
    const b = Math.floor(Math.random() * 20) + 10;
    return { a, b, answer: a + b };
  });

  // Get up to 3 caught Pokemon to show sleeping
  const caughtPokemon = ALL_PHONEMES
    .filter(p => gameState.pokemon[p.id]?.caught)
    .slice(0, 3);

  const handleParentAnswer = () => {
    if (parseInt(answer) === problem.answer) {
      onParentUnlock();
    } else {
      setAnswer('');
    }
  };

  return (
    <div className="session-lock-overlay">
      <div className="session-lock-card">
        {/* Sleeping Pokemon */}
        <div className="sleeping-pokemon-row">
          {caughtPokemon.map((p, i) => (
            <div key={p.id} className="sleeping-pokemon" style={{ animationDelay: `${i * 0.3}s` }}>
              <PokemonSprite
                pokedexId={p.pokemon.id}
                name={p.pokemon.name}
                size={80}
              />
              <span className="zzz">💤</span>
            </div>
          ))}
        </div>

        <h2>Great job today, trainer!</h2>
        <p className="lock-message">Your Pokemon need to rest now.</p>

        {/* Session stats */}
        <div className="lock-stats">
          <div className="lock-stat">
            <span className="lock-stat-value">{gameState.session.encountersThisSession}</span>
            <span className="lock-stat-label">Encounters</span>
          </div>
          <div className="lock-stat">
            <span className="lock-stat-value">{gameState.stats.totalCatches}</span>
            <span className="lock-stat-label">Pokemon</span>
          </div>
          <div className="lock-stat">
            <span className="lock-stat-value">{gameState.badges.length}</span>
            <span className="lock-stat-label">Badges</span>
          </div>
        </div>

        <p className="lock-comeback">Come back later for more adventure!</p>

        {/* Parent unlock */}
        {!showParentGate ? (
          <button
            className="parent-unlock-link"
            onClick={() => setShowParentGate(true)}
          >
            Parent: extend session
          </button>
        ) : (
          <div className="parent-gate">
            <p className="parent-gate-label">Solve to continue: {problem.a} + {problem.b} = ?</p>
            <div className="parent-gate-row">
              <input
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="parent-gate-input"
                inputMode="numeric"
                autoFocus
              />
              <button className="btn btn-primary parent-gate-btn" onClick={handleParentAnswer}>
                OK
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .session-lock-overlay {
          position: fixed;
          inset: 0;
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 24px;
        }

        .session-lock-card {
          background: rgba(255,255,255,0.95);
          border-radius: 24px;
          padding: 32px;
          text-align: center;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 16px 48px rgba(0,0,0,0.3);
        }

        .sleeping-pokemon-row {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .sleeping-pokemon {
          position: relative;
          animation: sleepBob 3s ease-in-out infinite;
          opacity: 0.7;
        }

        @keyframes sleepBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .zzz {
          position: absolute;
          top: -4px;
          right: -8px;
          font-size: 1.2rem;
          animation: zzzFloat 2s ease-in-out infinite;
        }

        @keyframes zzzFloat {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-8px); opacity: 1; }
        }

        h2 {
          color: #333;
          font-size: 1.5rem;
          margin-bottom: 4px;
        }

        .lock-message {
          color: #666;
          font-size: 1rem;
          margin-bottom: 20px;
        }

        .lock-stats {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 20px;
        }

        .lock-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .lock-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--pokemon-blue, #3B4CCA);
        }

        .lock-stat-label {
          font-size: 0.8rem;
          color: #888;
        }

        .lock-comeback {
          color: #888;
          font-size: 0.95rem;
          margin-bottom: 24px;
        }

        .parent-unlock-link {
          background: none;
          border: none;
          color: #bbb;
          font-size: 0.75rem;
          cursor: pointer;
          font-family: inherit;
          text-decoration: underline;
        }

        .parent-gate {
          margin-top: 12px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 12px;
        }

        .parent-gate-label {
          font-size: 0.85rem;
          color: #555;
          margin-bottom: 8px;
        }

        .parent-gate-row {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .parent-gate-input {
          width: 80px;
          padding: 8px 12px;
          font-size: 1.2rem;
          font-family: inherit;
          font-weight: 600;
          border: 2px solid #ddd;
          border-radius: 8px;
          text-align: center;
        }

        .parent-gate-btn {
          min-width: auto;
          min-height: auto;
          padding: 8px 20px;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}

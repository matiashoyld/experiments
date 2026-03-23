'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { useMusic } from '@/hooks/useMusic';
import PokemonSprite from '@/components/PokemonSprite';
import DailyTeaser from '@/components/DailyTeaser';
import { ALL_PHONEMES } from '@/data/phonemes';

export default function TitleScreen() {
  const router = useRouter();
  const { state, loaded, setPlayerName, startSession } = useGameState();
  const { speak, narrate } = useAudio();
  useMusic('title', loaded && state?.settings?.soundEnabled !== false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showNameEntry, setShowNameEntry] = useState(false);
  const [audioInit, setAudioInit] = useState(false);

  useEffect(() => {
    if (loaded && state && !state.playerName) {
      setShowNameEntry(true);
    }
  }, [loaded, state]);

  const handleStart = async () => {
    // Initialize audio context on first tap (iOS requirement)
    if (!audioInit) {
      setAudioInit(true);
      // Create and resume an AudioContext to unblock audio on iOS
      try {
        const ctx = new AudioContext();
        await ctx.resume();
        ctx.close();
      } catch {}
    }

    if (showNameEntry && nameInput.trim()) {
      setPlayerName(nameInput.trim());
      setShowNameEntry(false);
      startSession();
      await narrate.ui.welcomeFirst();
      router.push('/map');
    } else if (state?.playerName) {
      // Check if this is a new day for the daily teaser
      const today = new Date().toISOString().slice(0, 10);
      const isNewDay = state.session.lastSessionDate !== today;
      if (isNewDay && state.stats.totalCatches > 0) {
        startSession();
        setShowTeaser(true);
        return; // Show teaser before navigating
      }
      startSession();
      await narrate.ui.welcome();
      router.push('/map');
    }
  };

  // Get top 3 caught Pokemon for display
  const caughtPokemon = loaded && state
    ? ALL_PHONEMES.filter(p => state.pokemon[p.id]?.caught).slice(0, 3)
    : [];

  // Starter Pokemon to show if none caught
  const starterPokemon = [
    ALL_PHONEMES.find(p => p.id === 'p')!, // Pikachu
    ALL_PHONEMES.find(p => p.id === 's')!, // Squirtle
    ALL_PHONEMES.find(p => p.id === 'b')!, // Bulbasaur
  ].filter(Boolean);

  const displayPokemon = caughtPokemon.length > 0 ? caughtPokemon : starterPokemon;

  if (!loaded) {
    return (
      <div className="screen">
        <div className="loading-pokeball" />
      </div>
    );
  }

  return (
    <div className="screen title-screen">
      {/* Daily teaser modal */}
      {showTeaser && state && (
        <DailyTeaser
          gameState={state}
          onDismiss={() => {
            setShowTeaser(false);
            router.push('/map');
          }}
        />
      )}

      {/* Background decoration */}
      <div className="title-pokeball-bg" />

      {/* Pokemon sprites orbiting */}
      <div className="title-pokemon-row">
        {displayPokemon.map((p, i) => (
          <div key={p.id} className="title-pokemon-float" style={{ animationDelay: `${i * 0.5}s` }}>
            <PokemonSprite
              pokedexId={p.pokemon.id}
              name={p.pokemon.name}
              size={120}
              silhouette={!caughtPokemon.find(c => c.id === p.id)}
            />
          </div>
        ))}
      </div>

      {/* Title */}
      <h1 className="title-text">
        <span className="title-pokemon">Pokemon</span>
        <br />
        <span className="title-phonics">Phonics Adventure</span>
      </h1>

      {/* Name entry or welcome back */}
      {showNameEntry ? (
        <div className="title-name-entry slide-up">
          <p className="title-prompt">What&apos;s your name, trainer?</p>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value.slice(0, 12))}
            placeholder="Your name"
            className="title-name-input"
            autoFocus
            maxLength={12}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
          <button
            className="btn btn-primary btn-pulse"
            onClick={handleStart}
            disabled={!nameInput.trim()}
          >
            Start Adventure!
          </button>
        </div>
      ) : (
        <div className="title-welcome slide-up">
          {state?.playerName && (
            <p className="title-trainer-name">Trainer {state.playerName}</p>
          )}
          <button className="btn btn-primary btn-pulse" onClick={handleStart}>
            Tap to Start!
          </button>
          {state && state.stats.totalCatches > 0 && (
            <p className="title-stats">
              {state.stats.totalCatches} Pokemon caught
              {state.session.streak >= 3 && (
                <span className="title-streak"> 🔥 {state.session.streak}-day streak</span>
              )}
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        .title-screen {
          background: linear-gradient(180deg, #87CEEB 0%, #B3E5FC 30%, #98E4A6 70%, #78C850 100%);
          gap: 24px;
          text-align: center;
        }

        .title-pokeball-bg {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .title-pokemon-row {
          display: flex;
          gap: 16px;
          justify-content: center;
          z-index: 1;
        }

        .title-pokemon-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .title-text {
          z-index: 1;
          text-shadow: 3px 3px 0 rgba(0,0,0,0.1);
          line-height: 1.1;
        }

        .title-pokemon {
          color: var(--pokemon-yellow);
          font-size: 3rem;
          -webkit-text-stroke: 2px var(--pokemon-blue);
          paint-order: stroke fill;
        }

        .title-phonics {
          color: white;
          font-size: 2rem;
          -webkit-text-stroke: 1px var(--pokemon-blue);
          paint-order: stroke fill;
        }

        .title-name-entry {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          z-index: 1;
        }

        .title-prompt {
          font-size: 1.3rem;
          font-weight: 600;
          color: white;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.2);
        }

        .title-name-input {
          padding: 16px 24px;
          font-size: 1.5rem;
          font-family: inherit;
          font-weight: 600;
          border: 4px solid var(--pokemon-blue);
          border-radius: var(--radius);
          text-align: center;
          width: 250px;
          outline: none;
          background: white;
        }

        .title-name-input:focus {
          border-color: var(--pokemon-yellow);
          box-shadow: 0 0 0 4px rgba(255,215,0,0.3);
        }

        .title-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          z-index: 1;
        }

        .title-trainer-name {
          font-size: 1.4rem;
          font-weight: 600;
          color: white;
          text-shadow: 1px 1px 0 rgba(0,0,0,0.2);
        }

        .title-stats {
          font-size: 1rem;
          color: rgba(255,255,255,0.9);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

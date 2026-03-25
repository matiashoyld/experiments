'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameState } from '@/hooks/useGameState';
import { useAudio } from '@/hooks/useAudio';
import { useMusic } from '@/hooks/useMusic';
import DailyTeaser from '@/components/DailyTeaser';
import Image from 'next/image';

const PLAYER_NAME = 'Iñaki';

export default function TitleScreen() {
  const router = useRouter();
  const { state, loaded, setPlayerName, startSession } = useGameState();
  const { narrate } = useAudio();
  useMusic('title', loaded && state?.settings?.soundEnabled !== false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [audioInit, setAudioInit] = useState(false);
  const nameSet = useRef(false);

  // Auto-set player name on first load
  useEffect(() => {
    if (loaded && state && !state.playerName && !nameSet.current) {
      nameSet.current = true;
      setPlayerName(PLAYER_NAME);
    }
  }, [loaded, state, setPlayerName]);

  const handleStart = async () => {
    if (!audioInit) {
      setAudioInit(true);
      try {
        const ctx = new AudioContext();
        await ctx.resume();
        ctx.close();
      } catch {}
    }

    // Ensure name is set
    if (state && !state.playerName) {
      setPlayerName(PLAYER_NAME);
    }

    if (state) {
      const today = new Date().toISOString().slice(0, 10);
      const isNewDay = state.session.lastSessionDate !== today;
      if (isNewDay && state.stats.totalCatches > 0) {
        startSession();
        setShowTeaser(true);
        return;
      }
      startSession();
      if (state.stats.totalCatches > 0) {
        await narrate.ui.welcome();
      } else {
        await narrate.ui.welcomeFirst();
      }
      router.push('/map');
    }
  };

  if (!loaded) {
    return (
      <div className="screen">
        <div className="loading-pokeball" />
      </div>
    );
  }

  return (
    <div className="screen title-screen">
      {showTeaser && state && (
        <DailyTeaser
          gameState={state}
          onDismiss={() => {
            setShowTeaser(false);
            router.push('/map');
          }}
        />
      )}

      {/* Hero cover image */}
      <div className="title-hero">
        <Image
          src="/inaki-cover.png"
          alt="Iñaki with Pokemon"
          width={320}
          height={320}
          priority
          className="title-hero-img"
        />
      </div>

      {/* Title */}
      <h1 className="title-text">
        <span className="title-player-name">{PLAYER_NAME}&apos;s</span>
        <br />
        <span className="title-pokemon">Pokemon</span>
        {' '}
        <span className="title-phonics">Phonics</span>
      </h1>

      {/* Start button area */}
      <div className="title-welcome slide-up">
        <button className="btn btn-primary btn-pulse title-start-btn" onClick={handleStart}>
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

      <style jsx>{`
        .title-screen {
          background: linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%);
          gap: 16px;
          text-align: center;
          justify-content: center;
          padding: 24px 16px;
          overflow: hidden;
          position: relative;
        }

        .title-screen::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 20%, rgba(255,215,0,0.08) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(83,52,131,0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .title-hero {
          z-index: 1;
          display: flex;
          justify-content: center;
          animation: heroFloat 4s ease-in-out infinite;
          filter: drop-shadow(0 8px 32px rgba(255,215,0,0.3));
        }

        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .title-text {
          z-index: 1;
          line-height: 1.2;
          margin: 0;
        }

        .title-player-name {
          color: white;
          font-size: 1.6rem;
          font-weight: 700;
          text-shadow: 0 2px 8px rgba(0,0,0,0.5);
          letter-spacing: 0.5px;
        }

        .title-pokemon {
          color: var(--pokemon-yellow);
          font-size: 2.4rem;
          -webkit-text-stroke: 2px var(--pokemon-blue);
          paint-order: stroke fill;
          text-shadow: 0 3px 12px rgba(255,215,0,0.4);
        }

        .title-phonics {
          color: #7dd3fc;
          font-size: 2.4rem;
          -webkit-text-stroke: 1px rgba(125,211,252,0.3);
          paint-order: stroke fill;
          text-shadow: 0 2px 8px rgba(125,211,252,0.3);
        }

        .title-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          z-index: 1;
          margin-top: 8px;
        }

        .title-stats {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.75);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

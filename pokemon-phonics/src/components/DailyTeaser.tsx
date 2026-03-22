'use client';

import { useEffect, useState } from 'react';
import { REGIONS } from '@/data/regions';
import { GameState } from '@/hooks/useGameState';

interface DailyTeaserProps {
  gameState: GameState;
  onDismiss: () => void;
}

export default function DailyTeaser({ gameState, onDismiss }: DailyTeaserProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show teaser only if this is a new day (session wasn't started today yet)
    const today = new Date().toISOString().slice(0, 10);
    const isNewDay = gameState.session.lastSessionDate !== today;
    if (isNewDay && gameState.playerName) {
      setVisible(true);
    }
  }, [gameState]);

  if (!visible) return null;

  // Pick a random unlocked region for the teaser
  const unlockedRegions = REGIONS.filter(r => r.set <= gameState.currentSet);
  const teaserRegion = unlockedRegions[Math.floor(Math.random() * unlockedRegions.length)];

  const handleDismiss = () => {
    setVisible(false);
    onDismiss();
  };

  return (
    <div className="daily-teaser-overlay" onClick={handleDismiss}>
      <div className="daily-teaser-card" onClick={(e) => e.stopPropagation()}>
        <div className="teaser-sparkles">✨</div>
        <h2>Welcome back, {gameState.playerName}!</h2>
        <p className="teaser-message">
          A rare Pokemon has been spotted in <strong>{teaserRegion?.name || 'the wild'}</strong>!
        </p>
        {gameState.session.streak >= 3 && (
          <div className="teaser-streak">
            <span className="streak-flame">🔥</span>
            <span>{gameState.session.streak}-day streak!</span>
          </div>
        )}
        <button className="btn btn-primary" onClick={handleDismiss}>
          Let&apos;s Go!
        </button>
      </div>

      <style jsx>{`
        .daily-teaser-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9000;
          padding: 24px;
        }

        .daily-teaser-card {
          background: linear-gradient(135deg, #FFF8E1, #FFFDE7);
          border: 4px solid var(--pokemon-yellow, #FFD700);
          border-radius: 24px;
          padding: 32px;
          text-align: center;
          max-width: 360px;
          width: 100%;
          box-shadow: 0 16px 48px rgba(0,0,0,0.2);
          animation: bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes bounceIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .teaser-sparkles {
          font-size: 2.5rem;
          margin-bottom: 8px;
          animation: sparkle 1.5s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        h2 {
          color: #333;
          font-size: 1.3rem;
          margin-bottom: 8px;
        }

        .teaser-message {
          color: #555;
          font-size: 1rem;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .teaser-streak {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 1.1rem;
          font-weight: 700;
          color: #E65100;
          margin-bottom: 16px;
        }

        .streak-flame {
          font-size: 1.4rem;
          animation: flamePulse 0.8s ease-in-out infinite;
        }

        @keyframes flamePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

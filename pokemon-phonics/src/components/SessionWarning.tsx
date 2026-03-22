'use client';

import { useEffect, useState } from 'react';

interface SessionWarningProps {
  minutesElapsed: number;
  warningMinutes: number;
  lockMinutes: number;
}

export default function SessionWarning({ minutesElapsed, warningMinutes, lockMinutes }: SessionWarningProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (minutesElapsed >= warningMinutes && !dismissed) {
      setVisible(true);
    }
  }, [minutesElapsed, warningMinutes, dismissed]);

  if (!visible) return null;

  const remaining = Math.max(0, Math.ceil(lockMinutes - minutesElapsed));

  return (
    <div className="session-warning">
      <span className="warning-icon">😴</span>
      <span className="warning-text">
        Your Pokemon are getting tired! {remaining > 0 ? `${remaining} min left` : 'Rest time soon!'}
      </span>
      <button className="warning-dismiss" onClick={() => { setVisible(false); setDismissed(true); }}>
        OK
      </button>

      <style jsx>{`
        .session-warning {
          position: fixed;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #FF9800, #F57C00);
          color: white;
          padding: 10px 20px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 9998;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          animation: slideDown 0.4s ease;
          font-size: 0.9rem;
          font-weight: 600;
          max-width: 90vw;
        }

        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-60px); }
          to { transform: translateX(-50%) translateY(0); }
        }

        .warning-icon { font-size: 1.2rem; }
        .warning-text { white-space: nowrap; }

        .warning-dismiss {
          background: rgba(255,255,255,0.3);
          border: none;
          color: white;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.8rem;
          padding: 4px 12px;
          border-radius: 999px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

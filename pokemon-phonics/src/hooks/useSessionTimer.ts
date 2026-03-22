'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SessionTimerState {
  /** Minutes elapsed since session start */
  minutesElapsed: number;
  /** Whether the 8-min warning has been shown */
  warningShown: boolean;
  /** Whether the session is locked (10 min reached) */
  isLocked: boolean;
  /** Whether the session is active */
  isActive: boolean;
}

interface UseSessionTimerOptions {
  /** Session length in minutes before warning (default: 8) */
  warningMinutes?: number;
  /** Session length in minutes before lock (default: 10) */
  lockMinutes?: number;
  /** Called when warning threshold is reached */
  onWarning?: () => void;
  /** Called when lock threshold is reached */
  onLock?: () => void;
  /** Session start time from game state (epoch ms) */
  startTime: number | null;
}

export function useSessionTimer({
  warningMinutes = 8,
  lockMinutes = 10,
  onWarning,
  onLock,
  startTime,
}: UseSessionTimerOptions): SessionTimerState & {
  startSession: () => number;
  unlockSession: () => void;
} {
  const [minutesElapsed, setMinutesElapsed] = useState(0);
  const [warningShown, setWarningShown] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const warningFiredRef = useRef(false);
  const lockFiredRef = useRef(false);

  // Update elapsed time every 15 seconds
  useEffect(() => {
    if (!startTime) return;

    const update = () => {
      const elapsed = (Date.now() - startTime) / 60000;
      setMinutesElapsed(elapsed);

      if (elapsed >= warningMinutes && !warningFiredRef.current) {
        warningFiredRef.current = true;
        setWarningShown(true);
        onWarning?.();
      }

      if (elapsed >= lockMinutes && !lockFiredRef.current) {
        lockFiredRef.current = true;
        setIsLocked(true);
        onLock?.();
      }
    };

    update();
    const interval = setInterval(update, 15000);
    return () => clearInterval(interval);
  }, [startTime, warningMinutes, lockMinutes, onWarning, onLock]);

  const startSession = useCallback(() => {
    const now = Date.now();
    setMinutesElapsed(0);
    setWarningShown(false);
    setIsLocked(false);
    warningFiredRef.current = false;
    lockFiredRef.current = false;
    return now;
  }, []);

  const unlockSession = useCallback(() => {
    setIsLocked(false);
    lockFiredRef.current = false;
    // Reset warning too so it doesn't re-fire immediately
    warningFiredRef.current = true;
  }, []);

  return {
    minutesElapsed,
    warningShown,
    isLocked,
    isActive: startTime !== null,
    startSession,
    unlockSession,
  };
}

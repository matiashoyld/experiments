'use client';

import { useCallback } from 'react';

export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently fail — not all devices support it
      }
    }
  }, []);

  return {
    correctAnswer: () => vibrate(50),
    wrongAnswer: () => vibrate([30, 50, 30]),
    pokeballShake: () => vibrate(80),
    pokeballCatch: () => vibrate(200),
    pokemonFled: () => vibrate([20, 40, 20, 40, 20]),
    evolutionStart: () => vibrate([50, 50, 100, 50, 150, 50, 200]),
    evolutionComplete: () => vibrate(300),
    badgeEarned: () => vibrate([200, 100, 200]),
    battleHit: () => vibrate(100),
    battleTakeHit: () => vibrate([50, 30, 80]),
    buttonPress: () => vibrate(10),
  };
}

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { getChiptuneEngine, ThemeName } from '@/lib/chiptune';

/**
 * Hook to play Pokemon chiptune background music.
 * Automatically starts/stops when the component mounts/unmounts.
 * Only one theme plays at a time (singleton engine).
 */
export function useMusic(theme: ThemeName, enabled = true) {
  const engineRef = useRef(getChiptuneEngine());

  useEffect(() => {
    const engine = engineRef.current;
    if (enabled) {
      // Small delay to let the page render first
      const timer = setTimeout(() => engine.play(theme), 100);
      return () => {
        clearTimeout(timer);
        // Fade out when navigating away
        engine.fadeOut(400);
      };
    } else {
      if (engine.isPlaying()) {
        engine.fadeOut(400);
      }
    }
  }, [theme, enabled]);

  const setVolume = useCallback((v: number) => {
    engineRef.current.volume = v;
  }, []);

  const toggle = useCallback(() => {
    const engine = engineRef.current;
    if (engine.isPlaying()) {
      engine.fadeOut(300);
    } else {
      engine.play(theme);
    }
  }, [theme]);

  return { setVolume, toggle };
}

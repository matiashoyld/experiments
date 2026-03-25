'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'pokemon-phonics-game-state';

function getSnapshot(): 'lower' | 'upper' {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.settings?.letterCase || 'upper';
    }
  } catch {}
  return 'upper';
}

function getServerSnapshot(): 'lower' | 'upper' {
  return 'upper';
}

// Cache to avoid re-parsing on every render
let cachedValue: 'lower' | 'upper' = 'upper';
let lastRaw: string | null = null;

function getCachedSnapshot(): 'lower' | 'upper' {
  const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (raw !== lastRaw) {
    lastRaw = raw;
    cachedValue = getSnapshot();
  }
  return cachedValue;
}

function subscribe(callback: () => void) {
  // Listen for storage changes (from other tabs or our own updates)
  const handler = () => callback();
  window.addEventListener('storage', handler);

  // Also poll briefly since we update localStorage directly
  const interval = setInterval(callback, 1000);

  return () => {
    window.removeEventListener('storage', handler);
    clearInterval(interval);
  };
}

export function useLetterCase(): 'lower' | 'upper' {
  return useSyncExternalStore(subscribe, getCachedSnapshot, getServerSnapshot);
}

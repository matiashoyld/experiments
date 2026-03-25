'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PokemonState {
  caught: boolean;
  stage: 1 | 2 | 3;
  xp: number;
  isShiny: boolean;
  attempts: {
    correct: boolean;
    timestamp: number;
    responseTimeMs: number;
    challengeType: string;
  }[];
}

export interface GameState {
  version: number;
  playerName: string;
  currentPhase: 1 | 2;
  currentSet: number;
  pokemon: Record<string, PokemonState>;
  badges: string[];
  stats: {
    totalCatches: number;
    totalEvolutions: number;
    totalBattlesWon: number;
    totalCorrectAnswers: number;
    totalAttempts: number;
    sessionsCompleted: number;
  };
  session: {
    startTime: number | null;
    encountersThisSession: number;
    lastSessionDate: string;
    streak: number;
  };
  settings: {
    voiceName: string;
    sessionLengthMinutes: number;
    soundEnabled: boolean;
    letterCase: 'lower' | 'upper';
  };
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'pokemon-phonics-game-state';

function createDefaultState(): GameState {
  return {
    version: 1,
    playerName: '',
    currentPhase: 1,
    currentSet: 1,
    pokemon: {},
    badges: [],
    stats: {
      totalCatches: 0,
      totalEvolutions: 0,
      totalBattlesWon: 0,
      totalCorrectAnswers: 0,
      totalAttempts: 0,
      sessionsCompleted: 0,
    },
    session: {
      startTime: null,
      encountersThisSession: 0,
      lastSessionDate: '',
      streak: 0,
    },
    settings: {
      voiceName: 'Puck',
      sessionLengthMinutes: 8,
      soundEnabled: true,
      letterCase: 'upper',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Debounced sync to Redis — batches rapid updates into one request
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
function syncToRedis(state: GameState) {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    fetch('/api/game-state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch(() => {}); // silent fail — localStorage is the fallback
  }, 2000);
}

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load: localStorage first (instant), then try Redis for fresher data
  useEffect(() => {
    let localState: GameState | null = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) localState = JSON.parse(saved);
    } catch {}

    if (localState) {
      setState(localState);
      setLoaded(true);
    } else {
      setState(createDefaultState());
      setLoaded(true);
    }

    // Try Redis for potentially newer data (e.g. played on another device)
    fetch('/api/game-state')
      .then(res => res.ok ? res.json() : null)
      .then(remote => {
        if (!remote) return;
        // Use whichever is newer
        if (!localState || remote.updatedAt > localState.updatedAt) {
          setState(remote);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        }
      })
      .catch(() => {}); // offline or Redis not configured — that's fine
  }, []);

  // Save to localStorage + queue Redis sync
  const save = useCallback((newState: GameState) => {
    const updated = { ...newState, updatedAt: new Date().toISOString() };
    setState(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save game state:', e);
    }
    syncToRedis(updated);
  }, []);

  const updateState = useCallback((updater: (prev: GameState) => GameState) => {
    setState(prev => {
      if (!prev) return prev;
      const next = updater(prev);
      const updated = { ...next, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save game state:', e);
      }
      syncToRedis(updated);
      return updated;
    });
  }, []);

  const setPlayerName = useCallback((name: string) => {
    updateState(prev => ({ ...prev, playerName: name }));
  }, [updateState]);

  const catchPokemon = useCallback((phonemeId: string) => {
    updateState(prev => {
      const pokemon = { ...prev.pokemon };
      if (!pokemon[phonemeId]) {
        pokemon[phonemeId] = { caught: true, stage: 1, xp: 0, isShiny: false, attempts: [] };
      } else {
        pokemon[phonemeId] = { ...pokemon[phonemeId], caught: true };
      }
      return {
        ...prev,
        pokemon,
        stats: { ...prev.stats, totalCatches: prev.stats.totalCatches + 1 },
      };
    });
  }, [updateState]);

  const addAttempt = useCallback((phonemeId: string, attempt: PokemonState['attempts'][0]) => {
    updateState(prev => {
      const pokemon = { ...prev.pokemon };
      const current = pokemon[phonemeId] || { caught: false, stage: 1, xp: 0, isShiny: false, attempts: [] };
      const attempts = [...current.attempts, attempt].slice(-20); // Keep last 20
      const xp = current.xp + (attempt.correct ? 1 : 0);
      pokemon[phonemeId] = { ...current, attempts, xp };
      return {
        ...prev,
        pokemon,
        stats: {
          ...prev.stats,
          totalAttempts: prev.stats.totalAttempts + 1,
          totalCorrectAnswers: prev.stats.totalCorrectAnswers + (attempt.correct ? 1 : 0),
        },
      };
    });
  }, [updateState]);

  const evolvePokemon = useCallback((phonemeId: string, newStage: 1 | 2 | 3) => {
    updateState(prev => {
      const pokemon = { ...prev.pokemon };
      const current = pokemon[phonemeId];
      if (current) {
        pokemon[phonemeId] = { ...current, stage: newStage };
      }
      return {
        ...prev,
        pokemon,
        stats: { ...prev.stats, totalEvolutions: prev.stats.totalEvolutions + 1 },
      };
    });
  }, [updateState]);

  const earnBadge = useCallback((badgeId: string) => {
    updateState(prev => ({
      ...prev,
      badges: [...prev.badges, badgeId],
      currentSet: prev.currentSet + 1,
    }));
  }, [updateState]);

  const startSession = useCallback(() => {
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    updateState(prev => {
      const lastDate = prev.session.lastSessionDate;
      let streak = prev.session.streak;
      if (lastDate) {
        const last = new Date(lastDate);
        const diff = Math.floor((new Date(today).getTime() - last.getTime()) / 86400000);
        if (diff === 1) {
          streak += 1; // consecutive day
        } else if (diff > 1) {
          streak = 1; // reset silently
        }
        // diff === 0 means same day, keep streak
      } else {
        streak = 1; // first ever session
      }
      return {
        ...prev,
        session: {
          ...prev.session,
          startTime: now,
          encountersThisSession: 0,
          lastSessionDate: today,
          streak,
        },
      };
    });
    return now;
  }, [updateState]);

  const endSession = useCallback(() => {
    updateState(prev => ({
      ...prev,
      session: { ...prev.session, startTime: null },
      stats: { ...prev.stats, sessionsCompleted: prev.stats.sessionsCompleted + 1 },
    }));
  }, [updateState]);

  const resetProgress = useCallback(() => {
    const fresh = createDefaultState();
    save(fresh);
  }, [save]);

  return {
    state,
    loaded,
    setPlayerName,
    catchPokemon,
    addAttempt,
    evolvePokemon,
    earnBadge,
    startSession,
    endSession,
    resetProgress,
    updateState,
  };
}

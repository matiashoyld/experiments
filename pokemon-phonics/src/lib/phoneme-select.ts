import { PhonemeData, getPhonemesBySet, ALL_PHONEMES } from '@/data/phonemes';
import { PokemonState } from '@/hooks/useGameState';
import { calculateMastery } from './mastery';

interface PhonemeWithPriority {
  phoneme: PhonemeData;
  priority: number;
}

/**
 * Select a phoneme for an encounter based on current region and game state.
 * Implements the adaptive difficulty algorithm from SPEC.md.
 */
export function selectEncounterPhoneme(
  regionSet: number,
  currentSet: number,
  pokemonStates: Record<string, PokemonState>,
): PhonemeData {
  // Get phonemes from current region + previously mastered regions
  const candidatePhonemes: PhonemeData[] = [];
  for (let s = 1; s <= Math.min(regionSet, currentSet); s++) {
    candidatePhonemes.push(...getPhonemesBySet(s));
  }

  if (candidatePhonemes.length === 0) {
    return ALL_PHONEMES[0]; // fallback
  }

  // Calculate priority scores
  const scored: PhonemeWithPriority[] = candidatePhonemes.map(phoneme => {
    const state = pokemonStates[phoneme.id];
    let priority = 1.0;

    if (!state || state.attempts.length === 0) {
      // Never encountered — high priority
      priority *= 2.5;
    } else {
      const accuracy = calculateMastery(state.attempts);

      if (accuracy < 0.5) {
        priority *= 3.0; // struggling
      } else if (accuracy < 0.8) {
        priority *= 2.0; // needs work
      } else if (accuracy > 0.9) {
        priority *= 0.5; // strong, reduce frequency
      }

      // Boost phonemes not seen recently
      if (state.attempts.length > 0) {
        const lastSeen = state.attempts[state.attempts.length - 1].timestamp;
        const hoursSinceLastSeen = (Date.now() - lastSeen) / (1000 * 60 * 60);
        if (hoursSinceLastSeen > 24) {
          priority *= 1.5; // spaced review
        }
      }
    }

    // Slightly boost phonemes from the current region (vs review)
    if (phoneme.set === regionSet) {
      priority *= 1.2;
    }

    return { phoneme, priority };
  });

  // Weighted random selection
  return weightedRandomSelect(scored);
}

function weightedRandomSelect(items: PhonemeWithPriority[]): PhonemeData {
  const totalWeight = items.reduce((sum, item) => sum + item.priority, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.priority;
    if (random <= 0) return item.phoneme;
  }

  return items[items.length - 1].phoneme;
}

/**
 * Select challenge type based on phoneme mastery.
 */
export function selectChallengeType(
  phoneme: PhonemeData,
  pokemonState: PokemonState | undefined,
  currentSet: number,
): 'A' | 'B' | 'C' | 'D' {
  const accuracy = pokemonState
    ? calculateMastery(pokemonState.attempts)
    : 0;

  const types: ('A' | 'B' | 'C' | 'D')[] = [];

  if (accuracy < 0.6) {
    // Struggling — only A or B
    types.push('A', 'B');
  } else if (accuracy < 0.8) {
    // Needs work — A, B, or C
    types.push('A', 'B', 'C');
  } else {
    // Strong — include D if they have enough sets for CVC words
    types.push('A', 'B', 'C');
    if (currentSet >= 1 && pokemonState && pokemonState.stage >= 1) {
      types.push('D');
    }
  }

  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Select distractors for a challenge — other phonemes that are NOT the correct answer.
 * Prioritizes same-set phonemes and confusable pairs.
 */
export function selectDistractors(
  correctPhoneme: PhonemeData,
  count: number,
  currentSet: number,
): PhonemeData[] {
  // Confusable pairs for better discrimination training
  const confusablePairs: Record<string, string[]> = {
    'p': ['b', 'd', 't'],
    'b': ['p', 'd', 'g'],
    'd': ['b', 'g', 'p'],
    'g': ['d', 'k', 'c'],
    't': ['p', 'd', 'k'],
    'm': ['n', 'w'],
    'n': ['m', 'd'],
    's': ['z', 'f'],
    'f': ['v', 's', 'ff'],
    'v': ['f', 'w'],
    'c': ['k', 'g'],
    'k': ['c', 'g', 'ck'],
    'ck': ['k', 'c'],
    'ff': ['f', 'ss', 'll'],
    'll': ['l', 'ff', 'ss'],
    'ss': ['s', 'ff', 'll'],
  };

  // Get all available phonemes (from sets the child has seen)
  const available: PhonemeData[] = [];
  for (let s = 1; s <= currentSet; s++) {
    available.push(...getPhonemesBySet(s));
  }

  // Remove the correct answer
  const pool = available.filter(p => p.id !== correctPhoneme.id);

  // Try to include confusable pairs first
  const confusables = confusablePairs[correctPhoneme.id] || [];
  const confusablePhonemes = pool.filter(p => confusables.includes(p.id));
  const nonConfusable = pool.filter(p => !confusables.includes(p.id));

  // Prefer same-set, then confusable, then others
  const sameSet = nonConfusable.filter(p => p.set === correctPhoneme.set);
  const otherSets = nonConfusable.filter(p => p.set !== correctPhoneme.set);

  const ranked = [...confusablePhonemes, ...sameSet, ...otherSets];

  // Shuffle within priority groups, then take `count`
  const selected: PhonemeData[] = [];
  const used = new Set<string>();

  for (const p of ranked) {
    if (selected.length >= count) break;
    if (!used.has(p.id)) {
      selected.push(p);
      used.add(p.id);
    }
  }

  // If we still need more, take random from pool
  const remaining = pool.filter(p => !used.has(p.id));
  shuffleArray(remaining);
  for (const p of remaining) {
    if (selected.length >= count) break;
    selected.push(p);
  }

  shuffleArray(selected);
  return selected.slice(0, count);
}

function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

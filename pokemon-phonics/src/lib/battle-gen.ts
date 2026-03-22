import { WordEntry, getWordsForSets } from '@/data/words';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface BattleWord {
  word: WordEntry;
  letters: string[];
  correctWord: string;
  options: { word: string }[];
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Generate words for a gym battle.
 * The gym leader has `hp` HP — we need that many words.
 * Difficulty ramps: first 2-3 are easy CVC from this set,
 * middle ones mix in previous sets, final ones can be harder.
 */
export function generateBattleWords(
  regionSet: number,
  hp: number,
): BattleWord[] {
  const masteredSets = Array.from({ length: regionSet }, (_, i) => i + 1);

  // Get words from this region's set
  const currentSetWords = getWordsForSets(masteredSets).filter(w =>
    w.requiredSets.includes(regionSet) && w.type === 'cvc'
  );

  // Get easier words (only from previous sets)
  const easyWords = regionSet > 1
    ? getWordsForSets(masteredSets.slice(0, -1)).filter(w => w.type === 'cvc')
    : [];

  // Get all available CVC words
  const allWords = getWordsForSets(masteredSets).filter(w => w.type === 'cvc');

  const battleWords: BattleWord[] = [];
  const usedWords = new Set<string>();

  // Helper to pick a unique word from a pool
  const pickWord = (pool: WordEntry[]): WordEntry | null => {
    const available = pool.filter(w => !usedWords.has(w.word));
    if (available.length === 0) return null;
    const word = available[Math.floor(Math.random() * available.length)];
    usedWords.add(word.word);
    return word;
  };

  // Helper to create distractors
  const makeOptions = (target: WordEntry): { word: string }[] => {
    const others = allWords.filter(w => w.word !== target.word);
    const distractors = shuffleArray(others).slice(0, 2);
    return shuffleArray([
      { word: target.word },
      ...distractors.map(w => ({ word: w.word })),
    ]);
  };

  for (let i = 0; i < hp; i++) {
    let word: WordEntry | null = null;
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

    if (i < 2) {
      // First 2: easy words from current or previous sets
      word = pickWord(currentSetWords) || pickWord(allWords);
      difficulty = 'easy';
    } else if (i < hp - 1) {
      // Middle: mix of current and previous
      word = pickWord(allWords) || pickWord(currentSetWords);
      difficulty = 'medium';
    } else {
      // Final word: hardest available
      word = pickWord(currentSetWords) || pickWord(allWords);
      difficulty = 'hard';
    }

    if (!word) {
      // Fallback: reuse a word
      word = allWords[Math.floor(Math.random() * allWords.length)];
    }

    battleWords.push({
      word,
      letters: word.phonemes,
      correctWord: word.word,
      options: makeOptions(word),
      difficulty,
    });
  }

  return battleWords;
}

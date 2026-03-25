import { PhonemeData, getPhonemesBySet } from '@/data/phonemes';
import { WordEntry, getWordsForPhoneme, getWordsForSets } from '@/data/words';
import { selectDistractors } from './phoneme-select';

// Training exercises A-F

export interface TrainingExA {
  type: 'A';
  prompt: 'Tap the letter that makes this sound!';
  correctPhonemeId: string;
  correctGrapheme: string;
  options: { phonemeId: string; grapheme: string }[];
}

export interface TrainingExB {
  type: 'B';
  prompt: 'What sound does this letter make?';
  grapheme: string;
  correctPhonemeId: string;
  options: { phonemeId: string; grapheme: string }[];
}

export interface TrainingExC {
  type: 'C';
  prompt: 'Build this word!';
  targetWord: string;
  letters: string[]; // shuffled letters to arrange
  correctOrder: string[]; // correct letter order
}

export interface TrainingExD {
  type: 'D';
  prompt: 'Can you read this word?';
  word: WordEntry;
  letters: string[];
  correctWord: string;
  options: { word: string }[];
}

export interface TrainingExE {
  type: 'E';
  prompt: 'Which word matches?';
  targetWord: string;
  options: { word: string }[];
}

export type TrainingExercise = TrainingExA | TrainingExB | TrainingExC | TrainingExD | TrainingExE;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateTrainingExercise(
  phoneme: PhonemeData,
  stage: 1 | 2 | 3,
  currentSet: number,
): TrainingExercise {
  // All stages get all exercise types — word building (C), reading (D), matching (E)
  // are introduced from the start alongside letter recognition (A, B).
  // Stage determines the probability weighting.
  let types: ('A' | 'B' | 'C' | 'D' | 'E')[];
  if (stage === 1) {
    // Stage 1: heavy on A/B (letter recognition), but include C/D/E for early exposure
    types = ['A', 'A', 'B', 'B', 'C', 'D', 'E'];
  } else if (stage === 2) {
    // Stage 2: more word-level work
    types = ['A', 'B', 'C', 'D', 'D', 'E', 'E'];
  } else {
    // Stage 3: maintenance — balanced mix
    types = ['A', 'B', 'C', 'D', 'D', 'E', 'E'];
  }

  const type = types[Math.floor(Math.random() * types.length)];
  switch (type) {
    case 'A': return generateExA(phoneme, currentSet);
    case 'B': return generateExB(phoneme, currentSet);
    case 'C': return generateExC(phoneme, currentSet);
    case 'D': return generateExD(phoneme, currentSet);
    case 'E': return generateExE(phoneme, currentSet);
  }
}

function generateExA(phoneme: PhonemeData, currentSet: number): TrainingExA {
  const distractors = selectDistractors(phoneme, 3, currentSet);
  const options = shuffleArray([
    { phonemeId: phoneme.id, grapheme: phoneme.displayGrapheme },
    ...distractors.map(d => ({ phonemeId: d.id, grapheme: d.displayGrapheme })),
  ]);

  return {
    type: 'A',
    prompt: 'Tap the letter that makes this sound!',
    correctPhonemeId: phoneme.id,
    correctGrapheme: phoneme.displayGrapheme,
    options,
  };
}

function generateExB(phoneme: PhonemeData, currentSet: number): TrainingExB {
  const distractors = selectDistractors(phoneme, 3, currentSet);
  const options = shuffleArray([
    { phonemeId: phoneme.id, grapheme: phoneme.displayGrapheme },
    ...distractors.map(d => ({ phonemeId: d.id, grapheme: d.displayGrapheme })),
  ]);

  return {
    type: 'B',
    prompt: 'What sound does this letter make?',
    grapheme: phoneme.displayGrapheme,
    correctPhonemeId: phoneme.id,
    options,
  };
}

function generateExC(phoneme: PhonemeData, currentSet: number): TrainingExC {
  // Get a CVC word that uses this phoneme
  const masteredSets = Array.from({ length: currentSet }, (_, i) => i + 1);
  let words = getWordsForPhoneme(phoneme.id, masteredSets);

  if (words.length === 0) {
    // Fallback to any word from mastered sets
    words = getWordsForSets(masteredSets);
  }

  if (words.length === 0) {
    // Ultimate fallback: use example word
    const exWord = phoneme.exampleWords.cvc[0] || 'sat';
    return {
      type: 'C',
      prompt: 'Build this word!',
      targetWord: exWord,
      letters: shuffleArray(exWord.split('')),
      correctOrder: exWord.split(''),
    };
  }

  const word = words[Math.floor(Math.random() * words.length)];
  return {
    type: 'C',
    prompt: 'Build this word!',
    targetWord: word.word,
    letters: shuffleArray([...word.phonemes]),
    correctOrder: word.phonemes,
  };
}

function generateExD(phoneme: PhonemeData, currentSet: number): TrainingExD {
  const masteredSets = Array.from({ length: currentSet }, (_, i) => i + 1);
  let words = getWordsForPhoneme(phoneme.id, masteredSets);

  if (words.length === 0) {
    words = getWordsForSets(masteredSets);
  }

  if (words.length === 0) {
    // Fallback to ExA
    return generateExA(phoneme, currentSet) as unknown as TrainingExD;
  }

  const targetWord = words[Math.floor(Math.random() * words.length)];
  const allWords = getWordsForSets(masteredSets);
  const otherWords = allWords.filter(w => w.word !== targetWord.word);
  const distractorWords = shuffleArray(otherWords).slice(0, 2);

  const options = shuffleArray([
    { word: targetWord.word },
    ...distractorWords.map(w => ({ word: w.word })),
  ]);

  return {
    type: 'D',
    prompt: 'Can you read this word?',
    word: targetWord,
    letters: targetWord.phonemes,
    correctWord: targetWord.word,
    options,
  };
}

function generateExE(phoneme: PhonemeData, currentSet: number): TrainingExE {
  const masteredSets = Array.from({ length: currentSet }, (_, i) => i + 1);
  let words = getWordsForPhoneme(phoneme.id, masteredSets);

  if (words.length === 0) {
    words = getWordsForSets(masteredSets);
  }

  if (words.length === 0) {
    return {
      type: 'E',
      prompt: 'Which word matches?',
      targetWord: phoneme.exampleWords.cvc[0] || 'sat',
      options: shuffleArray([
        { word: phoneme.exampleWords.cvc[0] || 'sat' },
        { word: 'tap' },
        { word: 'pin' },
      ]),
    };
  }

  const targetWord = words[Math.floor(Math.random() * words.length)];
  const allWords = getWordsForSets(masteredSets);
  const otherWords = allWords.filter(w => w.word !== targetWord.word);
  const distractorWords = shuffleArray(otherWords).slice(0, 2);

  const options = shuffleArray([
    { word: targetWord.word },
    ...distractorWords.map(w => ({ word: w.word })),
  ]);

  return {
    type: 'E',
    prompt: 'Which word matches?',
    targetWord: targetWord.word,
    options,
  };
}

/**
 * Generate a full training session (5-8 exercises) for a phoneme.
 * Ensures type variety and mixes in other phonemes from the region for exposure.
 */
export function generateTrainingSession(
  phoneme: PhonemeData,
  stage: 1 | 2 | 3,
  currentSet: number,
): TrainingExercise[] {
  const exercises: TrainingExercise[] = [];

  // All exercise types available at all stages
  const availableTypes: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

  // First: one of each type (guarantees variety)
  const shuffledTypes = shuffleArray([...availableTypes]);
  for (const type of shuffledTypes) {
    switch (type) {
      case 'A': exercises.push(generateExA(phoneme, currentSet)); break;
      case 'B': exercises.push(generateExB(phoneme, currentSet)); break;
      case 'C': exercises.push(generateExC(phoneme, currentSet)); break;
      case 'D': exercises.push(generateExD(phoneme, currentSet)); break;
      case 'E': exercises.push(generateExE(phoneme, currentSet)); break;
    }
  }

  // Then: mix in 1-2 "bonus" exercises using other phonemes from the same region
  // This gives exposure to letters the child hasn't caught yet
  const regionPhonemes = getPhonemesBySet(phoneme.set).filter(p => p.id !== phoneme.id);
  if (regionPhonemes.length > 0) {
    const bonusCount = Math.min(2, regionPhonemes.length);
    const bonusPhonemes = shuffleArray(regionPhonemes).slice(0, bonusCount);
    for (const bonus of bonusPhonemes) {
      // Only simple exercises (A or B) for non-primary phonemes
      const bonusType = Math.random() < 0.5 ? 'A' : 'B';
      if (bonusType === 'A') {
        exercises.push(generateExA(bonus, currentSet));
      } else {
        exercises.push(generateExB(bonus, currentSet));
      }
    }
  }

  // Shuffle the full session so bonus exercises aren't always at the end
  return shuffleArray(exercises);
}

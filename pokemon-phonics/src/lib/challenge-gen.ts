import { PhonemeData } from '@/data/phonemes';
import { WordEntry, getWordsForPhoneme, getWordsForSets } from '@/data/words';
import { selectDistractors } from './phoneme-select';

export interface ChallengeTypeA {
  type: 'A';
  prompt: 'What sound does this letter make?';
  grapheme: string;
  correctPhonemeId: string;
  options: { phonemeId: string; grapheme: string }[];
}

export interface ChallengeTypeB {
  type: 'B';
  prompt: 'Which letter makes this sound?';
  correctPhonemeId: string;
  correctGrapheme: string;
  options: { phonemeId: string; grapheme: string }[];
}

export interface ChallengeTypeC {
  type: 'C';
  prompt: string; // "What sound do you hear at the start of 'sun'?"
  word: string;
  correctPhonemeId: string;
  options: { phonemeId: string; grapheme: string }[];
}

export interface ChallengeTypeD {
  type: 'D';
  prompt: 'Can you read this word?';
  word: WordEntry;
  letters: string[];
  correctWord: string;
  options: { word: string }[];
}

export type Challenge = ChallengeTypeA | ChallengeTypeB | ChallengeTypeC | ChallengeTypeD;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateChallenge(
  challengeType: 'A' | 'B' | 'C' | 'D',
  targetPhoneme: PhonemeData,
  currentSet: number,
): Challenge {
  switch (challengeType) {
    case 'A':
      return generateTypeA(targetPhoneme, currentSet);
    case 'B':
      return generateTypeB(targetPhoneme, currentSet);
    case 'C':
      return generateTypeC(targetPhoneme, currentSet);
    case 'D':
      return generateTypeD(targetPhoneme, currentSet);
  }
}

function generateTypeA(phoneme: PhonemeData, currentSet: number): ChallengeTypeA {
  const distractors = selectDistractors(phoneme, 2, currentSet);
  const options = shuffleArray([
    { phonemeId: phoneme.id, grapheme: phoneme.displayGrapheme },
    ...distractors.map(d => ({ phonemeId: d.id, grapheme: d.displayGrapheme })),
  ]);

  return {
    type: 'A',
    prompt: 'What sound does this letter make?',
    grapheme: phoneme.displayGrapheme,
    correctPhonemeId: phoneme.id,
    options,
  };
}

function generateTypeB(phoneme: PhonemeData, currentSet: number): ChallengeTypeB {
  const distractors = selectDistractors(phoneme, 2, currentSet);
  const options = shuffleArray([
    { phonemeId: phoneme.id, grapheme: phoneme.displayGrapheme },
    ...distractors.map(d => ({ phonemeId: d.id, grapheme: d.displayGrapheme })),
  ]);

  return {
    type: 'B',
    prompt: 'Which letter makes this sound?',
    correctPhonemeId: phoneme.id,
    correctGrapheme: phoneme.displayGrapheme,
    options,
  };
}

function generateTypeC(phoneme: PhonemeData, currentSet: number): ChallengeTypeC {
  // Pick an example word that starts with this phoneme
  const exampleWords = phoneme.exampleWords.cvc;
  const word = exampleWords[Math.floor(Math.random() * exampleWords.length)];

  const distractors = selectDistractors(phoneme, 2, currentSet);
  const options = shuffleArray([
    { phonemeId: phoneme.id, grapheme: phoneme.displayGrapheme },
    ...distractors.map(d => ({ phonemeId: d.id, grapheme: d.displayGrapheme })),
  ]);

  return {
    type: 'C',
    prompt: `What sound do you hear at the start of '${word}'?`,
    word,
    correctPhonemeId: phoneme.id,
    options,
  };
}

function generateTypeD(phoneme: PhonemeData, currentSet: number): ChallengeTypeD {
  // Get CVC words that use this phoneme and the child's mastered sets
  const masteredSets = Array.from({ length: currentSet }, (_, i) => i + 1);
  let words = getWordsForPhoneme(phoneme.id, masteredSets);

  // Fallback: if no words found, use the phoneme's example words
  if (words.length === 0) {
    const allWords = getWordsForSets(masteredSets);
    if (allWords.length > 0) {
      words = allWords;
    } else {
      // Ultimate fallback — create a synthetic challenge from example words
      return generateTypeA(phoneme, currentSet) as unknown as ChallengeTypeD;
    }
  }

  const targetWord = words[Math.floor(Math.random() * words.length)];

  // Get distractor words (different words the child can read)
  const allWords = getWordsForSets(masteredSets);
  const otherWords = allWords.filter(w => w.word !== targetWord.word);
  const shuffled = shuffleArray(otherWords);
  const distractorWords = shuffled.slice(0, 2);

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

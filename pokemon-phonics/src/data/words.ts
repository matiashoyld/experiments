export interface WordEntry {
  word: string;
  phonemes: string[];
  type: 'cvc' | 'ccvc' | 'cvcc' | 'tricky';
  requiredSets: number[];
}

// Words organized by which Sets are needed to read them
export const WORD_SETS: { sets: number[]; words: WordEntry[] }[] = [
  {
    sets: [1], // s, a, t, p, i, n (expanded Set 1)
    words: [
      { word: 'sat', phonemes: ['s', 'a', 't'], type: 'cvc', requiredSets: [1] },
      { word: 'tap', phonemes: ['t', 'a', 'p'], type: 'cvc', requiredSets: [1] },
      { word: 'pat', phonemes: ['p', 'a', 't'], type: 'cvc', requiredSets: [1] },
      { word: 'sap', phonemes: ['s', 'a', 'p'], type: 'cvc', requiredSets: [1] },
      { word: 'at', phonemes: ['a', 't'], type: 'cvc', requiredSets: [1] },
      { word: 'as', phonemes: ['a', 's'], type: 'cvc', requiredSets: [1] },
      // i and n words now available in Set 1
      { word: 'sit', phonemes: ['s', 'i', 't'], type: 'cvc', requiredSets: [1] },
      { word: 'pin', phonemes: ['p', 'i', 'n'], type: 'cvc', requiredSets: [1] },
      { word: 'tip', phonemes: ['t', 'i', 'p'], type: 'cvc', requiredSets: [1] },
      { word: 'nap', phonemes: ['n', 'a', 'p'], type: 'cvc', requiredSets: [1] },
      { word: 'tan', phonemes: ['t', 'a', 'n'], type: 'cvc', requiredSets: [1] },
      { word: 'sip', phonemes: ['s', 'i', 'p'], type: 'cvc', requiredSets: [1] },
      { word: 'tin', phonemes: ['t', 'i', 'n'], type: 'cvc', requiredSets: [1] },
      { word: 'pan', phonemes: ['p', 'a', 'n'], type: 'cvc', requiredSets: [1] },
      { word: 'pit', phonemes: ['p', 'i', 't'], type: 'cvc', requiredSets: [1] },
      { word: 'nip', phonemes: ['n', 'i', 'p'], type: 'cvc', requiredSets: [1] },
      { word: 'snap', phonemes: ['s', 'n', 'a', 'p'], type: 'ccvc', requiredSets: [1] },
      { word: 'spin', phonemes: ['s', 'p', 'i', 'n'], type: 'ccvc', requiredSets: [1] },
      { word: 'in', phonemes: ['i', 'n'], type: 'cvc', requiredSets: [1] },
      { word: 'an', phonemes: ['a', 'n'], type: 'cvc', requiredSets: [1] },
    ],
  },
  {
    sets: [1, 2], // adding m, d, g, o (new Set 2)
    words: [
      { word: 'man', phonemes: ['m', 'a', 'n'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'dim', phonemes: ['d', 'i', 'm'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'mat', phonemes: ['m', 'a', 't'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'map', phonemes: ['m', 'a', 'p'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'dip', phonemes: ['d', 'i', 'p'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'din', phonemes: ['d', 'i', 'n'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'dam', phonemes: ['d', 'a', 'm'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'mad', phonemes: ['m', 'a', 'd'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'sad', phonemes: ['s', 'a', 'd'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'mid', phonemes: ['m', 'i', 'd'], type: 'cvc', requiredSets: [1, 2] },
      // g and o words now in Set 2
      { word: 'got', phonemes: ['g', 'o', 't'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'dog', phonemes: ['d', 'o', 'g'], type: 'cvc', requiredSets: [2] },
      { word: 'mop', phonemes: ['m', 'o', 'p'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'pig', phonemes: ['p', 'i', 'g'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'dig', phonemes: ['d', 'i', 'g'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'gap', phonemes: ['g', 'a', 'p'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'gas', phonemes: ['g', 'a', 's'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'not', phonemes: ['n', 'o', 't'], type: 'cvc', requiredSets: [1, 2] },
      { word: 'nod', phonemes: ['n', 'o', 'd'], type: 'cvc', requiredSets: [1, 2] },
    ],
  },
  {
    sets: [1, 2, 3], // adding c, k, ck, e (new Set 3)
    words: [
      { word: 'cot', phonemes: ['c', 'o', 't'], type: 'cvc', requiredSets: [1, 2, 3] },
      { word: 'kit', phonemes: ['k', 'i', 't'], type: 'cvc', requiredSets: [1, 3] },
      { word: 'cod', phonemes: ['c', 'o', 'd'], type: 'cvc', requiredSets: [2, 3] },
      { word: 'cog', phonemes: ['c', 'o', 'g'], type: 'cvc', requiredSets: [2, 3] },
      { word: 'cap', phonemes: ['c', 'a', 'p'], type: 'cvc', requiredSets: [1, 3] },
      { word: 'cop', phonemes: ['c', 'o', 'p'], type: 'cvc', requiredSets: [1, 2, 3] },
      { word: 'cat', phonemes: ['c', 'a', 't'], type: 'cvc', requiredSets: [1, 3] },
      // ck and e words now in Set 3
      { word: 'pet', phonemes: ['p', 'e', 't'], type: 'cvc', requiredSets: [1, 3] },
      { word: 'ten', phonemes: ['t', 'e', 'n'], type: 'cvc', requiredSets: [1, 3] },
      { word: 'pen', phonemes: ['p', 'e', 'n'], type: 'cvc', requiredSets: [1, 3] },
      { word: 'net', phonemes: ['n', 'e', 't'], type: 'cvc', requiredSets: [1, 3] },
      { word: 'neck', phonemes: ['n', 'e', 'ck'], type: 'cvc', requiredSets: [1, 3] },
      { word: 'peck', phonemes: ['p', 'e', 'ck'], type: 'cvc', requiredSets: [1, 3] },
      { word: 'kick', phonemes: ['k', 'i', 'ck'], type: 'cvc', requiredSets: [1, 3] },
      { word: 'pick', phonemes: ['p', 'i', 'ck'], type: 'cvc', requiredSets: [1, 3] },
      { word: 'sick', phonemes: ['s', 'i', 'ck'], type: 'cvc', requiredSets: [1, 3] },
    ],
  },
  {
    sets: [1, 2, 3, 4], // adding u, r, h, b (new Set 4)
    words: [
      { word: 'red', phonemes: ['r', 'e', 'd'], type: 'cvc', requiredSets: [2, 3, 4] },
      { word: 'run', phonemes: ['r', 'u', 'n'], type: 'cvc', requiredSets: [1, 4] },
      { word: 'cup', phonemes: ['c', 'u', 'p'], type: 'cvc', requiredSets: [1, 3, 4] },
      { word: 'sun', phonemes: ['s', 'u', 'n'], type: 'cvc', requiredSets: [1, 4] },
      { word: 'duck', phonemes: ['d', 'u', 'ck'], type: 'cvc', requiredSets: [2, 3, 4] },
      { word: 'sock', phonemes: ['s', 'o', 'ck'], type: 'cvc', requiredSets: [1, 2, 3, 4] },
      { word: 'rug', phonemes: ['r', 'u', 'g'], type: 'cvc', requiredSets: [2, 4] },
      { word: 'hut', phonemes: ['h', 'u', 't'], type: 'cvc', requiredSets: [1, 4] },
      { word: 'hat', phonemes: ['h', 'a', 't'], type: 'cvc', requiredSets: [1, 4] },
      { word: 'hot', phonemes: ['h', 'o', 't'], type: 'cvc', requiredSets: [1, 2, 4] },
      { word: 'hit', phonemes: ['h', 'i', 't'], type: 'cvc', requiredSets: [1, 4] },
      { word: 'bus', phonemes: ['b', 'u', 's'], type: 'cvc', requiredSets: [1, 4] },
      { word: 'bat', phonemes: ['b', 'a', 't'], type: 'cvc', requiredSets: [1, 4] },
      { word: 'big', phonemes: ['b', 'i', 'g'], type: 'cvc', requiredSets: [1, 2, 4] },
      { word: 'bed', phonemes: ['b', 'e', 'd'], type: 'cvc', requiredSets: [2, 3, 4] },
      { word: 'bug', phonemes: ['b', 'u', 'g'], type: 'cvc', requiredSets: [2, 4] },
      { word: 'cut', phonemes: ['c', 'u', 't'], type: 'cvc', requiredSets: [1, 3, 4] },
      { word: 'rut', phonemes: ['r', 'u', 't'], type: 'cvc', requiredSets: [1, 4] },
      { word: 'peck', phonemes: ['p', 'e', 'ck'], type: 'cvc', requiredSets: [1, 4] },
      { word: 'kick', phonemes: ['k', 'i', 'ck'], type: 'cvc', requiredSets: [2, 3, 4] },
    ],
  },
  {
    sets: [1, 2, 3, 4, 5], // adding h, b, f, ff, l, ll, ss
    words: [
      { word: 'hat', phonemes: ['h', 'a', 't'], type: 'cvc', requiredSets: [1, 5] },
      { word: 'bat', phonemes: ['b', 'a', 't'], type: 'cvc', requiredSets: [1, 5] },
      { word: 'bus', phonemes: ['b', 'u', 's'], type: 'cvc', requiredSets: [1, 4, 5] },
      { word: 'fun', phonemes: ['f', 'u', 'n'], type: 'cvc', requiredSets: [2, 4, 5] },
      { word: 'leg', phonemes: ['l', 'e', 'g'], type: 'cvc', requiredSets: [3, 4, 5] },
      { word: 'hot', phonemes: ['h', 'o', 't'], type: 'cvc', requiredSets: [1, 3, 5] },
      { word: 'big', phonemes: ['b', 'i', 'g'], type: 'cvc', requiredSets: [2, 3, 5] },
      { word: 'hiss', phonemes: ['h', 'i', 'ss'], type: 'cvc', requiredSets: [2, 5] },
      { word: 'bell', phonemes: ['b', 'e', 'll'], type: 'cvc', requiredSets: [4, 5] },
      { word: 'hill', phonemes: ['h', 'i', 'll'], type: 'cvc', requiredSets: [2, 5] },
      { word: 'off', phonemes: ['o', 'ff'], type: 'cvc', requiredSets: [3, 5] },
      { word: 'hug', phonemes: ['h', 'u', 'g'], type: 'cvc', requiredSets: [3, 4, 5] },
      { word: 'fill', phonemes: ['f', 'i', 'll'], type: 'cvc', requiredSets: [2, 5] },
      { word: 'miss', phonemes: ['m', 'i', 'ss'], type: 'cvc', requiredSets: [2, 5] },
      { word: 'boss', phonemes: ['b', 'o', 'ss'], type: 'cvc', requiredSets: [3, 5] },
      { word: 'log', phonemes: ['l', 'o', 'g'], type: 'cvc', requiredSets: [3, 5] },
    ],
  },
];

export function getWordsForSets(masteredSets: number[]): WordEntry[] {
  const words: WordEntry[] = [];
  for (const wordSet of WORD_SETS) {
    if (wordSet.sets.every(s => masteredSets.includes(s))) {
      words.push(...wordSet.words);
    }
  }
  return words;
}

export function getWordsForPhoneme(phonemeId: string, masteredSets: number[]): WordEntry[] {
  return getWordsForSets(masteredSets).filter(w => w.phonemes.includes(phonemeId));
}

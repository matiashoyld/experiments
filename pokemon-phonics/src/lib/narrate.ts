/**
 * Centralized narration module.
 *
 * All screens use this instead of calling speak() directly.
 * Each function tries the pre-generated MP3 first, then falls back
 * to Web Speech API if the file is missing.
 */

type PlayFn = (key: string) => Promise<void>;
type SpeakFn = (text: string) => Promise<void>;

function tryPlay(playNarration: PlayFn, speak: SpeakFn, key: string, fallback: string): Promise<void> {
  return playNarration(key).catch(() => speak(fallback));
}

function randomKey(prefix: string, count: number): string {
  const n = Math.floor(Math.random() * count) + 1;
  return `${prefix}-${n}`;
}

export function createNarration(playNarration: PlayFn, speak: SpeakFn) {
  return {
    encounter: {
      appeared: (phonemeId: string, pokemonName: string) =>
        tryPlay(playNarration, speak, `encounter/appear/${phonemeId}`, `A wild ${pokemonName} appeared!`),
      caught: (phonemeId: string, pokemonName: string) =>
        tryPlay(playNarration, speak, `encounter/caught/${phonemeId}`, `Gotcha! ${pokemonName} was caught!`),
      fled: (phonemeId: string, pokemonName: string) =>
        tryPlay(playNarration, speak, `encounter/fled/${phonemeId}`, `Oh no, ${pokemonName} fled!`),
    },
    challenge: {
      whatSound: () =>
        tryPlay(playNarration, speak, 'challenge/what-sound', 'What sound does this letter make?'),
      whichLetter: () =>
        tryPlay(playNarration, speak, 'challenge/which-letter', 'Which letter makes this sound?'),
      firstSound: (word: string) =>
        tryPlay(playNarration, speak, 'challenge/first-sound', `What is the first sound in ${word}?`),
      readWord: () =>
        tryPlay(playNarration, speak, 'challenge/read-word', 'Can you read this word?'),
      blend: () =>
        tryPlay(playNarration, speak, 'challenge/blend', 'Blend the sounds together!'),
      success: () =>
        tryPlay(playNarration, speak, 'challenge/success', 'Yes!'),
    },
    battle: {
      intro: (regionId: number, regionName: string) =>
        tryPlay(playNarration, speak, `battle/intro/${regionId}`, `Welcome to ${regionName} Gym!`),
      greeting: (regionId: number, greetingText: string) =>
        tryPlay(playNarration, speak, `battle/greeting/${regionId}`, greetingText),
      attack: (word: string) =>
        tryPlay(playNarration, speak, 'battle/attack', `The gym leader used ${word} attack! Can you read it?`),
      hit: () =>
        tryPlay(playNarration, speak, randomKey('battle/hit', 3), "It's super effective!"),
      miss: () =>
        tryPlay(playNarration, speak, randomKey('battle/miss', 3), 'The attack missed!'),
      encourage: () =>
        tryPlay(playNarration, speak, 'battle/encourage', "Don't worry, you're doing great!"),
      defeat: (regionId: number, defeatText: string) =>
        tryPlay(playNarration, speak, `battle/defeat/${regionId}`, defeatText),
      victory: (regionId: number, leaderName: string) =>
        tryPlay(playNarration, speak, `battle/victory/${regionId}`, `You beat ${leaderName}!`),
      newArea: (regionName: string) =>
        tryPlay(playNarration, speak, 'battle/new-area', `A new area has been discovered! ${regionName} is now open!`),
    },
    training: {
      intro: (pokemonName: string) =>
        tryPlay(playNarration, speak, 'training/intro', `Let's train ${pokemonName}!`),
      correct: () =>
        tryPlay(playNarration, speak, randomKey('training/correct', 8), 'Great job!'),
      almost: () =>
        tryPlay(playNarration, speak, 'training/almost', 'Almost! Try again next time!'),
      shiny: (pokemonName: string) =>
        tryPlay(playNarration, speak, 'training/shiny', `Amazing! ${pokemonName} is sparkling! It became a shiny Pokemon!`),
    },
    evolution: {
      start: (phonemeId: string, fromName: string) =>
        tryPlay(playNarration, speak, `evolution/start/${phonemeId}`, `What? ${fromName} is evolving!`),
      start2: (phonemeId: string, fromName: string) =>
        tryPlay(playNarration, speak, `evolution/start2/${phonemeId}`, `What? ${fromName} is evolving!`),
      complete: (phonemeId: string, toStage: number, fromName: string, toName: string) =>
        tryPlay(playNarration, speak, `evolution/complete/${phonemeId}-${toStage}`, `${fromName} evolved into ${toName}!`),
    },
    badge: {
      earned: (regionId: number, badgeName: string) =>
        tryPlay(playNarration, speak, `badge/${regionId}`, `You earned the ${badgeName}!`),
    },
    ui: {
      tired: () =>
        tryPlay(playNarration, speak, 'ui/tired', 'Your Pokemon are getting tired! Time for a rest?'),
      welcome: () =>
        tryPlay(playNarration, speak, 'ui/welcome', 'Welcome back, trainer!'),
      welcomeFirst: () =>
        tryPlay(playNarration, speak, 'ui/welcome-first', 'Welcome to Pokemon Phonics!'),
      explore: (regionName: string) =>
        tryPlay(playNarration, speak, 'ui/explore', `Let's explore ${regionName}!`),
      locked: (regionName: string) =>
        tryPlay(playNarration, speak, 'ui/locked', `${regionName} is locked. Keep training to unlock it!`),
    },
    mnemonic: {
      play: (phonemeId: string, text: string) =>
        tryPlay(playNarration, speak, `mnemonic/${phonemeId}`, text),
    },
  };
}

export type Narration = ReturnType<typeof createNarration>;

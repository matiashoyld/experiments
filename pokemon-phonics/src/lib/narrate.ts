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
    battle: {
      intro: (regionId: number, regionName: string) =>
        tryPlay(playNarration, speak, `battle/intro/${regionId}`, `Welcome to ${regionName} Gym!`),
      greeting: (regionId: number, greetingText: string) =>
        tryPlay(playNarration, speak, `battle/greeting/${regionId}`, greetingText),
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
    },
    training: {
      correct: () =>
        tryPlay(playNarration, speak, randomKey('training/correct', 8), 'Great job!'),
      almost: () =>
        tryPlay(playNarration, speak, 'training/almost', 'Almost! Try again next time!'),
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
    },
    mnemonic: {
      play: (phonemeId: string, text: string) =>
        tryPlay(playNarration, speak, `mnemonic/${phonemeId}`, text),
    },
  };
}

export type Narration = ReturnType<typeof createNarration>;

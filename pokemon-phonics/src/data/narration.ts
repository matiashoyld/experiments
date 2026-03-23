import { ALL_PHONEMES } from './phonemes';
import { GYM_LEADERS } from './gym-leaders';
import { REGIONS } from './regions';

export interface NarrationEntry {
  key: string;
  text: string;
  voiceName: 'Puck' | 'Leda' | 'Achird';
  style: string;
  category: string;
}

function generateNarrationEntries(): NarrationEntry[] {
  const entries: NarrationEntry[] = [];

  // === Encounter narration ===
  for (const phoneme of ALL_PHONEMES) {
    const name = phoneme.pokemon.name;
    entries.push({
      key: `encounter/appear/${phoneme.id}`,
      text: `A wild ${name} appeared!`,
      voiceName: 'Puck',
      style: 'Say excitedly:',
      category: 'Encounters - Appear',
    });
    entries.push({
      key: `encounter/caught/${phoneme.id}`,
      text: `Gotcha! ${name} was caught!`,
      voiceName: 'Puck',
      style: 'Say triumphantly:',
      category: 'Encounters - Caught',
    });
    entries.push({
      key: `encounter/fled/${phoneme.id}`,
      text: `Oh no! ${name} fled!`,
      voiceName: 'Puck',
      style: 'Say with mild disappointment:',
      category: 'Encounters - Fled',
    });
  }

  // === Challenge narration ===
  const challengeLines: { key: string; text: string }[] = [
    { key: 'challenge/what-sound', text: 'What sound does this letter make?' },
    { key: 'challenge/which-letter', text: 'Which letter makes this sound?' },
    { key: 'challenge/first-sound', text: 'What is the first sound in this word?' },
    { key: 'challenge/read-word', text: 'Can you read this word?' },
    { key: 'challenge/blend', text: 'Blend the sounds together!' },
    { key: 'challenge/success', text: 'Yes!' },
  ];
  for (const line of challengeLines) {
    entries.push({
      key: line.key,
      text: line.text,
      voiceName: 'Leda',
      style: 'Say clearly and encouragingly:',
      category: 'Challenges',
    });
  }

  // === Training narration ===
  const trainingLines: { key: string; text: string }[] = [
    { key: 'training/intro', text: "Let's train your Pokemon!" },
    { key: 'training/correct-1', text: 'Great job!' },
    { key: 'training/correct-2', text: 'Well done!' },
    { key: 'training/correct-3', text: "That's right!" },
    { key: 'training/correct-4', text: 'Amazing!' },
    { key: 'training/correct-5', text: 'You got it!' },
    { key: 'training/correct-6', text: 'Brilliant!' },
    { key: 'training/correct-7', text: 'Super!' },
    { key: 'training/correct-8', text: 'Fantastic!' },
    { key: 'training/almost', text: 'Almost! Listen again...' },
    { key: 'training/try-again', text: "Let's try that one more time." },
    { key: 'training/shiny', text: 'Amazing! It became a shiny Pokemon!' },
  ];
  for (const line of trainingLines) {
    entries.push({
      key: line.key,
      text: line.text,
      voiceName: 'Leda',
      style: 'Say warmly and encouragingly:',
      category: 'Training',
    });
  }

  // === Evolution narration ===
  for (const phoneme of ALL_PHONEMES) {
    const evo = phoneme.pokemon.evolutionLine;
    // Stage 1 → Stage 2
    if (evo.stage1.name !== evo.stage2.name) {
      entries.push({
        key: `evolution/start/${phoneme.id}`,
        text: `What? ${evo.stage1.name} is evolving!`,
        voiceName: 'Puck',
        style: 'Say with excitement and wonder:',
        category: 'Evolution - Start',
      });
      entries.push({
        key: `evolution/complete/${phoneme.id}-2`,
        text: `${evo.stage1.name} evolved into ${evo.stage2.name}!`,
        voiceName: 'Puck',
        style: 'Say triumphantly:',
        category: 'Evolution - Complete',
      });
    }
    // Stage 2 → Stage 3
    if (evo.stage2.name !== evo.stage3.name) {
      entries.push({
        key: `evolution/start2/${phoneme.id}`,
        text: `What? ${evo.stage2.name} is evolving!`,
        voiceName: 'Puck',
        style: 'Say with excitement and wonder:',
        category: 'Evolution - Start',
      });
      entries.push({
        key: `evolution/complete/${phoneme.id}-3`,
        text: `${evo.stage2.name} evolved into ${evo.stage3.name}!`,
        voiceName: 'Puck',
        style: 'Say triumphantly:',
        category: 'Evolution - Complete',
      });
    }
  }

  // === Battle narration ===
  for (const leader of GYM_LEADERS) {
    const region = REGIONS.find(r => r.id === leader.regionId);
    entries.push({
      key: `battle/intro/${leader.regionId}`,
      text: `Welcome to ${region?.name || 'the'} Gym!`,
      voiceName: 'Achird',
      style: 'Say in a friendly but authoritative voice:',
      category: 'Battle - Intro',
    });
    entries.push({
      key: `battle/greeting/${leader.regionId}`,
      text: leader.greeting,
      voiceName: 'Achird',
      style: 'Say in a friendly, challenging voice:',
      category: 'Battle - Greeting',
    });
    entries.push({
      key: `battle/defeat/${leader.regionId}`,
      text: leader.defeat,
      voiceName: 'Achird',
      style: 'Say warmly and impressed:',
      category: 'Battle - Defeat',
    });
    entries.push({
      key: `battle/victory/${leader.regionId}`,
      text: `You beat ${leader.name}!`,
      voiceName: 'Puck',
      style: 'Say triumphantly:',
      category: 'Battle - Victory',
    });
  }

  const battleFeedback: { key: string; text: string }[] = [
    { key: 'battle/hit-1', text: "It's super effective!" },
    { key: 'battle/hit-2', text: "A critical hit!" },
    { key: 'battle/hit-3', text: "Direct hit!" },
    { key: 'battle/miss-1', text: "The attack missed!" },
    { key: 'battle/miss-2', text: "It didn't quite land." },
    { key: 'battle/miss-3', text: "So close!" },
    { key: 'battle/encourage', text: "Don't worry, you're doing great!" },
    { key: 'battle/attack', text: 'The gym leader used an attack! Can you read it?' },
    { key: 'battle/new-area', text: 'A new area has been discovered!' },
  ];
  for (const line of battleFeedback) {
    entries.push({
      key: line.key,
      text: line.text,
      voiceName: 'Puck',
      style: 'Say expressively:',
      category: 'Battle - Feedback',
    });
  }

  // === Badge narration ===
  for (const region of REGIONS) {
    entries.push({
      key: `badge/${region.id}`,
      text: `You earned the ${region.badgeName}!`,
      voiceName: 'Puck',
      style: 'Say triumphantly and celebratory:',
      category: 'Badges',
    });
  }

  // === UI narration ===
  const uiLines: { key: string; text: string }[] = [
    { key: 'ui/welcome', text: 'Welcome back, trainer!' },
    { key: 'ui/welcome-first', text: 'Welcome to Pokemon Phonics!' },
    { key: 'ui/where-go', text: 'Where shall we go today?' },
    { key: 'ui/good-job', text: 'Great job today, trainer!' },
    { key: 'ui/tired', text: 'Your Pokemon are getting tired! Time for a rest?' },
    { key: 'ui/explore', text: "Let's explore!" },
    { key: 'ui/locked', text: 'This area is locked. Keep training to unlock it!' },
  ];
  for (const line of uiLines) {
    entries.push({
      key: line.key,
      text: line.text,
      voiceName: 'Puck',
      style: 'Say cheerfully:',
      category: 'UI',
    });
  }

  // === Mnemonic phrases ===
  for (const phoneme of ALL_PHONEMES) {
    entries.push({
      key: `mnemonic/${phoneme.id}`,
      text: phoneme.mnemonicPhrase,
      voiceName: 'Puck',
      style: 'Say enthusiastically, emphasizing the sound:',
      category: 'Mnemonics',
    });
  }

  return entries;
}

export const ALL_NARRATION = generateNarrationEntries();

export function getNarrationByCategory(): Record<string, NarrationEntry[]> {
  const grouped: Record<string, NarrationEntry[]> = {};
  for (const entry of ALL_NARRATION) {
    if (!grouped[entry.category]) grouped[entry.category] = [];
    grouped[entry.category].push(entry);
  }
  return grouped;
}

export function getNarrationEntry(key: string): NarrationEntry | undefined {
  return ALL_NARRATION.find(e => e.key === key);
}

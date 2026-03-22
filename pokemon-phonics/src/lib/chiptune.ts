// ============================================
// Pokemon-style Chiptune Music Engine
// Game Boy-inspired 4-channel synthesizer
// ============================================

// --- Note frequency table ---
const N: Record<string, number> = {
  // Octave 2
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  Db2: 69.30, Eb2: 77.78, Gb2: 92.50, Ab2: 103.83, Bb2: 116.54,
  // Octave 3
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  Db3: 138.59, Eb3: 155.56, Gb3: 185.00, Ab3: 207.65, Bb3: 233.08,
  // Octave 4
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  Db4: 277.18, Eb4: 311.13, Gb4: 369.99, Ab4: 415.30, Bb4: 466.16,
  // Octave 5
  C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  Db5: 554.37, Eb5: 622.25, Gb5: 739.99, Ab5: 830.61, Bb5: 932.33,
  // Octave 6
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
};

// --- Types ---
type NoteEntry = [string | null, number]; // [noteName | null for rest, duration in beats]
type PercEntry = [string | null, number]; // ['kick'|'snare'|'hat'|null, duration]

interface ThemeVoices {
  bpm: number;
  melody: NoteEntry[];
  harmony: NoteEntry[];
  bass: NoteEntry[];
  perc: PercEntry[];
}

// --- Theme compositions ---

function mapTheme(): ThemeVoices {
  // Inspired by Pallet Town / Route 1 — C major, cheerful, 120 BPM
  // Chord progression: C - Am - F - G | C - Am - Dm - G
  const bpm = 126;
  const melody: NoteEntry[] = [
    // Bar 1: C major — bright opening phrase
    ['E5', 0.5], ['G5', 0.5], ['A5', 0.5], ['G5', 0.5],
    ['E5', 0.75], ['C5', 0.25], ['D5', 1],
    // Bar 2: Am — descending answer
    ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['A4', 0.5],
    ['B4', 0.5], ['C5', 0.5], ['D5', 1],
    // Bar 3: F — lyrical rise
    ['C5', 0.5], ['F5', 0.5], ['A5', 0.5], ['G5', 0.5],
    ['F5', 0.75], ['E5', 0.25], ['D5', 1],
    // Bar 4: G — turnaround
    ['D5', 0.5], ['E5', 0.5], ['G5', 0.5], ['B5', 0.5],
    ['A5', 0.5], ['G5', 0.5], ['E5', 1],
    // Bar 5: C — variation, higher energy
    ['G5', 0.5], ['A5', 0.5], ['B5', 0.5], ['C6', 0.5],
    ['B5', 0.5], ['A5', 0.5], ['G5', 1],
    // Bar 6: Am — gentle descent
    ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 0.5],
    ['D5', 0.5], ['E5', 0.5], ['A4', 1],
    // Bar 7: Dm — building tension
    ['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['G5', 0.5],
    ['F5', 0.5], ['E5', 0.5], ['D5', 1],
    // Bar 8: G — resolution lead-in
    ['B4', 0.5], ['D5', 0.5], ['G5', 0.5], ['F5', 0.5],
    ['E5', 0.5], ['D5', 0.5], ['C5', 1],
  ];

  const harmony: NoteEntry[] = [
    // Arpeggiated chords, 8th note patterns
    // Bar 1: C
    ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['E4', 0.5],
    ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['E4', 0.5],
    // Bar 2: Am
    ['A3', 0.5], ['C4', 0.5], ['E4', 0.5], ['C4', 0.5],
    ['A3', 0.5], ['C4', 0.5], ['E4', 0.5], ['C4', 0.5],
    // Bar 3: F
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    // Bar 4: G
    ['G3', 0.5], ['B3', 0.5], ['D4', 0.5], ['B3', 0.5],
    ['G3', 0.5], ['B3', 0.5], ['D4', 0.5], ['B3', 0.5],
    // Bar 5: C
    ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['E4', 0.5],
    ['C4', 0.5], ['E4', 0.5], ['G4', 0.5], ['E4', 0.5],
    // Bar 6: Am
    ['A3', 0.5], ['C4', 0.5], ['E4', 0.5], ['C4', 0.5],
    ['A3', 0.5], ['C4', 0.5], ['E4', 0.5], ['C4', 0.5],
    // Bar 7: Dm
    ['D3', 0.5], ['F3', 0.5], ['A3', 0.5], ['F3', 0.5],
    ['D3', 0.5], ['F3', 0.5], ['A3', 0.5], ['F3', 0.5],
    // Bar 8: G
    ['G3', 0.5], ['B3', 0.5], ['D4', 0.5], ['B3', 0.5],
    ['G3', 0.5], ['B3', 0.5], ['D4', 0.5], ['B3', 0.5],
  ];

  const bass: NoteEntry[] = [
    // Bar 1: C
    ['C3', 1], ['G2', 0.5], ['C3', 0.5], ['E3', 1], ['C3', 1],
    // Bar 2: Am
    ['A2', 1], ['E2', 0.5], ['A2', 0.5], ['C3', 1], ['A2', 1],
    // Bar 3: F
    ['F2', 1], ['C3', 0.5], ['F2', 0.5], ['A2', 1], ['F2', 1],
    // Bar 4: G
    ['G2', 1], ['D3', 0.5], ['G2', 0.5], ['B2', 1], ['G2', 1],
    // Bar 5: C
    ['C3', 1], ['G2', 0.5], ['C3', 0.5], ['E3', 1], ['C3', 1],
    // Bar 6: Am
    ['A2', 1], ['E2', 0.5], ['A2', 0.5], ['C3', 1], ['A2', 1],
    // Bar 7: Dm
    ['D3', 1], ['A2', 0.5], ['D3', 0.5], ['F3', 1], ['D3', 1],
    // Bar 8: G
    ['G2', 1], ['D3', 0.5], ['G2', 0.5], ['B2', 1], ['G2', 1],
  ];

  const perc: PercEntry[] = Array.from({ length: 8 }, () => [
    // Per bar: kick-hat-snare-hat pattern
    ['kick', 0.5], ['hat', 0.5], ['snare', 0.5], ['hat', 0.5],
    ['kick', 0.5], ['hat', 0.5], ['snare', 0.5], ['hat', 0.5],
  ]).flat() as PercEntry[];

  return { bpm, melody, harmony, bass, perc };
}

function battleTheme(): ThemeVoices {
  // Intense trainer battle — E minor, 156 BPM, driving
  // Chords: Em - C - D - B | Em - C - Am - B
  const bpm = 156;
  const melody: NoteEntry[] = [
    // Bar 1: Em — aggressive opening
    ['E5', 0.25], ['E5', 0.25], ['B5', 0.5], ['A5', 0.25], ['G5', 0.25],
    ['E5', 0.5], ['Gb5', 0.5], ['G5', 0.5], [null, 0.5],
    // Bar 2: C — chromatic descent
    ['G5', 0.25], ['A5', 0.25], ['B5', 0.5], ['A5', 0.5],
    ['G5', 0.25], ['E5', 0.25], ['C5', 0.5], ['D5', 0.5],
    // Bar 3: D — rising intensity
    ['D5', 0.25], ['Gb5', 0.25], ['A5', 0.5], ['B5', 0.5],
    ['A5', 0.25], ['Gb5', 0.25], ['D5', 0.5], ['E5', 0.5],
    // Bar 4: B — climax turnaround
    ['Gb5', 0.25], ['Gb5', 0.25], ['B5', 0.5], ['A5', 0.5],
    ['Gb5', 0.5], ['Eb5', 0.5], ['B4', 0.5],
    // Bar 5: Em — variation
    ['E5', 0.5], ['G5', 0.25], ['A5', 0.25], ['B5', 0.5],
    ['E5', 0.25], ['G5', 0.25], ['A5', 0.5], ['G5', 0.5],
    // Bar 6: C — driving
    ['C5', 0.25], ['E5', 0.25], ['G5', 0.5], ['A5', 0.5],
    ['G5', 0.25], ['E5', 0.25], ['C5', 0.5], ['D5', 0.5],
    // Bar 7: Am — dark tension
    ['A4', 0.25], ['C5', 0.25], ['E5', 0.5], ['D5', 0.5],
    ['C5', 0.25], ['B4', 0.25], ['A4', 0.5], ['B4', 0.5],
    // Bar 8: B — resolve to repeat
    ['B4', 0.5], ['Eb5', 0.5], ['Gb5', 0.5], ['B5', 0.5],
    ['A5', 0.25], ['Gb5', 0.25], ['E5', 0.5], [null, 0.5],
  ];

  const harmony: NoteEntry[] = [
    // Fast arpeggiated power chords
    // Bar 1: Em
    ['E4', 0.25], ['G4', 0.25], ['B4', 0.25], ['G4', 0.25],
    ['E4', 0.25], ['G4', 0.25], ['B4', 0.25], ['G4', 0.25],
    ['E4', 0.25], ['G4', 0.25], ['B4', 0.25], ['G4', 0.25],
    [null, 0.5], [null, 0.5],
    // Bar 2: C
    ['C4', 0.25], ['E4', 0.25], ['G4', 0.25], ['E4', 0.25],
    ['C4', 0.25], ['E4', 0.25], ['G4', 0.25], ['E4', 0.25],
    ['C4', 0.25], ['E4', 0.25], ['G4', 0.25], ['E4', 0.25],
    [null, 0.25], [null, 0.25], [null, 0.5],
    // Bar 3: D
    ['D4', 0.25], ['Gb4', 0.25], ['A4', 0.25], ['Gb4', 0.25],
    ['D4', 0.25], ['Gb4', 0.25], ['A4', 0.25], ['Gb4', 0.25],
    ['D4', 0.25], ['Gb4', 0.25], ['A4', 0.25], ['Gb4', 0.25],
    [null, 0.5], [null, 0.5],
    // Bar 4: B
    ['B3', 0.25], ['Eb4', 0.25], ['Gb4', 0.25], ['Eb4', 0.25],
    ['B3', 0.25], ['Eb4', 0.25], ['Gb4', 0.25], ['Eb4', 0.25],
    ['B3', 0.25], ['Eb4', 0.25], ['Gb4', 0.25], ['Eb4', 0.25],
    [null, 0.25], [null, 0.25], [null, 0.5],
    // Bar 5: Em
    ['E4', 0.25], ['G4', 0.25], ['B4', 0.25], ['G4', 0.25],
    ['E4', 0.25], ['G4', 0.25], ['B4', 0.25], ['G4', 0.25],
    ['E4', 0.25], ['G4', 0.25], ['B4', 0.25], ['G4', 0.25],
    [null, 0.5], [null, 0.5],
    // Bar 6: C
    ['C4', 0.25], ['E4', 0.25], ['G4', 0.25], ['E4', 0.25],
    ['C4', 0.25], ['E4', 0.25], ['G4', 0.25], ['E4', 0.25],
    ['C4', 0.25], ['E4', 0.25], ['G4', 0.25], ['E4', 0.25],
    [null, 0.5], [null, 0.5],
    // Bar 7: Am
    ['A3', 0.25], ['C4', 0.25], ['E4', 0.25], ['C4', 0.25],
    ['A3', 0.25], ['C4', 0.25], ['E4', 0.25], ['C4', 0.25],
    ['A3', 0.25], ['C4', 0.25], ['E4', 0.25], ['C4', 0.25],
    [null, 0.5], [null, 0.5],
    // Bar 8: B
    ['B3', 0.25], ['Eb4', 0.25], ['Gb4', 0.25], ['Eb4', 0.25],
    ['B3', 0.25], ['Eb4', 0.25], ['Gb4', 0.25], ['Eb4', 0.25],
    ['B3', 0.25], ['Eb4', 0.25], ['Gb4', 0.25], ['Eb4', 0.25],
    [null, 0.5], [null, 0.5],
  ];

  const bass: NoteEntry[] = [
    // Driving 8th note bass
    // Bar 1: Em
    ['E2', 0.5], ['E2', 0.5], ['E3', 0.5], ['E2', 0.5],
    ['G2', 0.5], ['E2', 0.5], ['B2', 0.5], ['E2', 0.5],
    // Bar 2: C
    ['C2', 0.5], ['C2', 0.5], ['C3', 0.5], ['C2', 0.5],
    ['G2', 0.5], ['C2', 0.5], ['E2', 0.5], ['C2', 0.5],
    // Bar 3: D
    ['D2', 0.5], ['D2', 0.5], ['D3', 0.5], ['D2', 0.5],
    ['A2', 0.5], ['D2', 0.5], ['Gb2', 0.5], ['D2', 0.5],
    // Bar 4: B
    ['B2', 0.5], ['B2', 0.5], ['Gb2', 0.5], ['B2', 0.5],
    ['Eb2', 0.5], ['B2', 0.5], ['Gb2', 0.5], ['B2', 0.5],
    // Bar 5: Em
    ['E2', 0.5], ['E2', 0.5], ['E3', 0.5], ['E2', 0.5],
    ['G2', 0.5], ['E2', 0.5], ['B2', 0.5], ['E2', 0.5],
    // Bar 6: C
    ['C2', 0.5], ['C2', 0.5], ['C3', 0.5], ['C2', 0.5],
    ['G2', 0.5], ['C2', 0.5], ['E2', 0.5], ['C2', 0.5],
    // Bar 7: Am
    ['A2', 0.5], ['A2', 0.5], ['A2', 0.5], ['E2', 0.5],
    ['C3', 0.5], ['A2', 0.5], ['E2', 0.5], ['A2', 0.5],
    // Bar 8: B
    ['B2', 0.5], ['B2', 0.5], ['Gb2', 0.5], ['B2', 0.5],
    ['Eb2', 0.5], ['B2', 0.5], ['Gb2', 0.5], ['B2', 0.5],
  ];

  const perc: PercEntry[] = Array.from({ length: 8 }, () => [
    // Fast driving pattern
    ['kick', 0.25], ['hat', 0.25], ['hat', 0.25], ['hat', 0.25],
    ['snare', 0.25], ['hat', 0.25], ['kick', 0.25], ['hat', 0.25],
    ['kick', 0.25], ['hat', 0.25], ['hat', 0.25], ['hat', 0.25],
    ['snare', 0.25], ['hat', 0.25], ['snare', 0.25], ['hat', 0.25],
  ]).flat() as PercEntry[];

  return { bpm, melody, harmony, bass, perc };
}

function encounterTheme(): ThemeVoices {
  // Wild encounter tension — A minor, 138 BPM, dramatic
  // Chords: Am - F - Dm - E | Am - F - G - E
  const bpm = 138;
  const melody: NoteEntry[] = [
    // Bar 1: Am — dramatic opening
    ['A5', 0.25], [null, 0.25], ['A5', 0.25], ['G5', 0.25],
    ['E5', 0.5], ['C5', 0.5], ['E5', 0.5], ['A4', 0.5],
    // Bar 2: F
    ['F5', 0.5], ['A5', 0.5], ['G5', 0.25], ['F5', 0.25],
    ['E5', 0.5], ['C5', 0.5], ['D5', 0.5], [null, 0.5],
    // Bar 3: Dm
    ['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['G5', 0.25], ['F5', 0.25],
    ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], [null, 0.5],
    // Bar 4: E — tension peak
    ['E5', 0.25], ['E5', 0.25], ['Ab5', 0.5], ['B5', 0.5],
    ['A5', 0.25], ['Ab5', 0.25], ['E5', 0.5], [null, 1],
    // Bar 5: Am — second phrase
    ['C5', 0.5], ['E5', 0.5], ['A5', 0.5], ['B5', 0.25], ['A5', 0.25],
    ['G5', 0.5], ['E5', 0.5], ['A4', 0.5], [null, 0.5],
    // Bar 6: F
    ['F5', 0.25], ['G5', 0.25], ['A5', 0.5], ['G5', 0.5],
    ['F5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5],
    // Bar 7: G
    ['G4', 0.5], ['B4', 0.5], ['D5', 0.5], ['G5', 0.5],
    ['F5', 0.5], ['E5', 0.5], ['D5', 0.5], ['B4', 0.5],
    // Bar 8: E — resolve
    ['E5', 0.5], ['Ab4', 0.25], ['B4', 0.25], ['E5', 0.5],
    ['D5', 0.25], ['C5', 0.25], ['B4', 0.5], ['A4', 1],
  ];

  const harmony: NoteEntry[] = [
    // Pulsing chord stabs
    // Bar 1: Am
    ['A3', 0.5], ['C4', 0.5], ['E4', 0.5], ['C4', 0.5],
    ['A3', 0.5], ['C4', 0.5], ['E4', 0.5], ['C4', 0.5],
    // Bar 2: F
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    // Bar 3: Dm
    ['D3', 0.5], ['F3', 0.5], ['A3', 0.5], ['F3', 0.5],
    ['D3', 0.5], ['F3', 0.5], ['A3', 0.5], ['F3', 0.5],
    // Bar 4: E
    ['E3', 0.5], ['Ab3', 0.5], ['B3', 0.5], ['Ab3', 0.5],
    ['E3', 0.5], ['Ab3', 0.5], ['B3', 0.5], ['Ab3', 0.5],
    // Bar 5: Am
    ['A3', 0.5], ['C4', 0.5], ['E4', 0.5], ['C4', 0.5],
    ['A3', 0.5], ['C4', 0.5], ['E4', 0.5], ['C4', 0.5],
    // Bar 6: F
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    // Bar 7: G
    ['G3', 0.5], ['B3', 0.5], ['D4', 0.5], ['B3', 0.5],
    ['G3', 0.5], ['B3', 0.5], ['D4', 0.5], ['B3', 0.5],
    // Bar 8: E
    ['E3', 0.5], ['Ab3', 0.5], ['B3', 0.5], ['Ab3', 0.5],
    ['E3', 0.5], ['Ab3', 0.5], ['B3', 0.5], ['Ab3', 0.5],
  ];

  const bass: NoteEntry[] = [
    // Rhythmic bass, root-fifth motion
    // Bar 1: Am
    ['A2', 1], ['E2', 0.5], ['A2', 0.5], ['C3', 1], ['A2', 1],
    // Bar 2: F
    ['F2', 1], ['C3', 0.5], ['F2', 0.5], ['A2', 1], ['F2', 1],
    // Bar 3: Dm
    ['D2', 1], ['A2', 0.5], ['D2', 0.5], ['F2', 1], ['D2', 1],
    // Bar 4: E
    ['E2', 1], ['B2', 0.5], ['E2', 0.5], ['Ab2', 1], ['E2', 1],
    // Bar 5: Am
    ['A2', 1], ['E2', 0.5], ['A2', 0.5], ['C3', 1], ['A2', 1],
    // Bar 6: F
    ['F2', 1], ['C3', 0.5], ['F2', 0.5], ['A2', 1], ['F2', 1],
    // Bar 7: G
    ['G2', 1], ['D3', 0.5], ['G2', 0.5], ['B2', 1], ['G2', 1],
    // Bar 8: E
    ['E2', 1], ['B2', 0.5], ['E2', 0.5], ['Ab2', 0.5], ['E2', 0.5], ['E2', 1],
  ];

  const perc: PercEntry[] = Array.from({ length: 8 }, () => [
    ['kick', 0.5], ['hat', 0.5], ['snare', 0.5], ['hat', 0.25], ['hat', 0.25],
    ['kick', 0.5], ['hat', 0.5], ['snare', 0.5], ['hat', 0.5],
  ]).flat() as PercEntry[];

  return { bpm, melody, harmony, bass, perc };
}

function trainingTheme(): ThemeVoices {
  // Pokemon Center / healing — F major, gentle, 100 BPM
  // Chords: F - Dm - Bb - C | F - Am - Dm - C
  const bpm = 100;
  const melody: NoteEntry[] = [
    // Bar 1: F — warm, gentle opening
    ['A5', 1], ['G5', 0.5], ['F5', 0.5],
    ['E5', 0.5], ['F5', 0.5], ['A5', 1],
    // Bar 2: Dm — soft descent
    ['F5', 0.5], ['E5', 0.5], ['D5', 1],
    ['C5', 0.5], ['D5', 0.5], ['F5', 1],
    // Bar 3: Bb — lyrical
    ['D5', 0.5], ['F5', 0.5], ['Bb5', 1],
    ['A5', 0.5], ['G5', 0.5], ['F5', 1],
    // Bar 4: C — resolve gently
    ['E5', 0.5], ['G5', 0.5], ['C5', 1],
    ['D5', 0.5], ['E5', 0.5], ['F5', 1],
    // Bar 5: F — second phrase, higher
    ['C6', 1], ['Bb5', 0.5], ['A5', 0.5],
    ['G5', 0.5], ['A5', 0.5], ['F5', 1],
    // Bar 6: Am — minor color
    ['A5', 0.5], ['G5', 0.5], ['E5', 1],
    ['C5', 0.5], ['E5', 0.5], ['A5', 1],
    // Bar 7: Dm — winding down
    ['D5', 0.5], ['F5', 0.5], ['A5', 0.5], ['G5', 0.5],
    ['F5', 0.5], ['E5', 0.5], ['D5', 1],
    // Bar 8: C — peaceful close
    ['C5', 0.5], ['E5', 0.5], ['G5', 1],
    ['F5', 0.5], ['E5', 0.5], ['F5', 1],
  ];

  const harmony: NoteEntry[] = [
    // Gentle broken chords, slower
    // Bar 1: F
    ['F3', 1], ['A3', 1], ['C4', 1], ['A3', 1],
    // Bar 2: Dm
    ['D3', 1], ['F3', 1], ['A3', 1], ['F3', 1],
    // Bar 3: Bb
    ['Bb3', 1], ['D4', 1], ['F4', 1], ['D4', 1],
    // Bar 4: C
    ['C4', 1], ['E4', 1], ['G4', 1], ['E4', 1],
    // Bar 5: F
    ['F3', 1], ['A3', 1], ['C4', 1], ['A3', 1],
    // Bar 6: Am
    ['A3', 1], ['C4', 1], ['E4', 1], ['C4', 1],
    // Bar 7: Dm
    ['D3', 1], ['F3', 1], ['A3', 1], ['F3', 1],
    // Bar 8: C
    ['C4', 1], ['E4', 1], ['G4', 1], ['E4', 1],
  ];

  const bass: NoteEntry[] = [
    // Simple, warm bass — half notes
    // Bar 1: F
    ['F2', 2], ['C3', 2],
    // Bar 2: Dm
    ['D2', 2], ['A2', 2],
    // Bar 3: Bb
    ['Bb2', 2], ['F2', 2],
    // Bar 4: C
    ['C3', 2], ['G2', 2],
    // Bar 5: F
    ['F2', 2], ['C3', 2],
    // Bar 6: Am
    ['A2', 2], ['E2', 2],
    // Bar 7: Dm
    ['D2', 2], ['A2', 2],
    // Bar 8: C
    ['C3', 2], ['G2', 2],
  ];

  // Very light percussion — just soft taps
  const perc: PercEntry[] = Array.from({ length: 8 }, () => [
    [null, 1] as PercEntry, ['hat', 1] as PercEntry, [null, 1] as PercEntry, ['hat', 1] as PercEntry,
  ]).flat();

  return { bpm, melody, harmony, bass, perc };
}

function titleTheme(): ThemeVoices {
  // Grand, triumphant title — Bb major, 140 BPM
  // Chords: Bb - F - Gm - Eb | Bb - F - Cm - F
  const bpm = 140;
  const melody: NoteEntry[] = [
    // Bar 1: Bb — triumphant fanfare
    ['Bb5', 0.5], ['F5', 0.25], ['D5', 0.25], ['Bb4', 0.5], ['D5', 0.5],
    ['F5', 0.5], ['Bb5', 0.5], ['A5', 0.5], [null, 0.5],
    // Bar 2: F — soaring
    ['A5', 0.5], ['Bb5', 0.5], ['C6', 0.5], ['A5', 0.5],
    ['F5', 0.5], ['G5', 0.5], ['A5', 0.5], [null, 0.5],
    // Bar 3: Gm — dramatic dip
    ['G5', 0.5], ['Bb5', 0.5], ['D6', 0.5], ['C6', 0.25], ['Bb5', 0.25],
    ['A5', 0.5], ['G5', 0.5], ['F5', 0.5], [null, 0.5],
    // Bar 4: Eb — grand
    ['Eb5', 0.5], ['G5', 0.5], ['Bb5', 0.5], ['C6', 0.5],
    ['Bb5', 0.5], ['A5', 0.5], ['Bb5', 1],
    // Bar 5: Bb — repeat with variation
    ['D6', 0.5], ['C6', 0.25], ['Bb5', 0.25], ['A5', 0.5], ['Bb5', 0.5],
    ['F5', 0.5], ['D5', 0.5], ['F5', 0.5], [null, 0.5],
    // Bar 6: F — building
    ['C6', 0.5], ['A5', 0.5], ['F5', 0.5], ['A5', 0.5],
    ['C6', 0.5], ['D6', 0.5], ['C6', 0.5], [null, 0.5],
    // Bar 7: Cm — darker moment
    ['Eb5', 0.5], ['G5', 0.5], ['C6', 0.5], ['Bb5', 0.25], ['A5', 0.25],
    ['G5', 0.5], ['F5', 0.5], ['Eb5', 0.5], ['D5', 0.5],
    // Bar 8: F — triumphant resolve
    ['C5', 0.5], ['F5', 0.5], ['A5', 0.5], ['C6', 0.5],
    ['Bb5', 0.5], ['A5', 0.5], ['Bb5', 1],
  ];

  const harmony: NoteEntry[] = [
    // Bold arpeggiated chords
    // Bar 1: Bb
    ['Bb3', 0.5], ['D4', 0.5], ['F4', 0.5], ['D4', 0.5],
    ['Bb3', 0.5], ['D4', 0.5], ['F4', 0.5], ['D4', 0.5],
    // Bar 2: F
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    // Bar 3: Gm
    ['G3', 0.5], ['Bb3', 0.5], ['D4', 0.5], ['Bb3', 0.5],
    ['G3', 0.5], ['Bb3', 0.5], ['D4', 0.5], ['Bb3', 0.5],
    // Bar 4: Eb
    ['Eb3', 0.5], ['G3', 0.5], ['Bb3', 0.5], ['G3', 0.5],
    ['Eb3', 0.5], ['G3', 0.5], ['Bb3', 0.5], ['G3', 0.5],
    // Bar 5: Bb
    ['Bb3', 0.5], ['D4', 0.5], ['F4', 0.5], ['D4', 0.5],
    ['Bb3', 0.5], ['D4', 0.5], ['F4', 0.5], ['D4', 0.5],
    // Bar 6: F
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    // Bar 7: Cm
    ['C3', 0.5], ['Eb3', 0.5], ['G3', 0.5], ['Eb3', 0.5],
    ['C3', 0.5], ['Eb3', 0.5], ['G3', 0.5], ['Eb3', 0.5],
    // Bar 8: F
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
    ['F3', 0.5], ['A3', 0.5], ['C4', 0.5], ['A3', 0.5],
  ];

  const bass: NoteEntry[] = [
    // Bold root movement
    ['Bb2', 1], ['F2', 0.5], ['Bb2', 0.5], ['D3', 1], ['Bb2', 1],
    ['F2', 1], ['C3', 0.5], ['F2', 0.5], ['A2', 1], ['F2', 1],
    ['G2', 1], ['D3', 0.5], ['G2', 0.5], ['Bb2', 1], ['G2', 1],
    ['Eb2', 1], ['Bb2', 0.5], ['Eb2', 0.5], ['G2', 1], ['Eb2', 1],
    ['Bb2', 1], ['F2', 0.5], ['Bb2', 0.5], ['D3', 1], ['Bb2', 1],
    ['F2', 1], ['C3', 0.5], ['F2', 0.5], ['A2', 1], ['F2', 1],
    ['C3', 1], ['G2', 0.5], ['C3', 0.5], ['Eb3', 1], ['C3', 1],
    ['F2', 1], ['C3', 0.5], ['F2', 0.5], ['A2', 0.5], ['F2', 0.5], ['F2', 1],
  ];

  const perc: PercEntry[] = Array.from({ length: 8 }, () => [
    ['kick', 0.5], ['hat', 0.5], ['snare', 0.5], ['hat', 0.25], ['hat', 0.25],
    ['kick', 0.25], ['kick', 0.25], ['hat', 0.5], ['snare', 0.5], ['hat', 0.5],
  ]).flat() as PercEntry[];

  return { bpm, melody, harmony, bass, perc };
}

// --- Synthesizer Engine ---

export type ThemeName = 'title' | 'map' | 'encounter' | 'battle' | 'training';

const THEMES: Record<ThemeName, () => ThemeVoices> = {
  title: titleTheme,
  map: mapTheme,
  encounter: encounterTheme,
  battle: battleTheme,
  training: trainingTheme,
};

export class ChiptuneEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTheme: ThemeName | null = null;
  private playing = false;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0;
  private activeNodes: (OscillatorNode | AudioBufferSourceNode)[] = [];
  // Per-voice scheduling state
  private voiceIndex: Record<string, number> = {};
  private voiceBeatTime: Record<string, number> = {};
  private themeData: ThemeVoices | null = null;
  private _volume = 0.25;

  get volume() { return this._volume; }

  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this._volume, this.ctx!.currentTime);
    }
  }

  private ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  play(theme: ThemeName) {
    if (this.currentTheme === theme && this.playing) return;
    this.stop();

    const ctx = this.ensureContext();
    this.themeData = THEMES[theme]();
    this.currentTheme = theme;
    this.playing = true;

    // Reset voice indices
    this.voiceIndex = { melody: 0, harmony: 0, bass: 0, perc: 0 };
    this.nextNoteTime = ctx.currentTime + 0.05;
    this.voiceBeatTime = {
      melody: this.nextNoteTime,
      harmony: this.nextNoteTime,
      bass: this.nextNoteTime,
      perc: this.nextNoteTime,
    };

    // Look-ahead scheduler: runs every 25ms, schedules 100ms ahead
    this.schedulerTimer = setInterval(() => this.scheduler(), 25);
  }

  private scheduler() {
    if (!this.ctx || !this.themeData || !this.playing) return;
    const lookAhead = 0.1; // seconds
    const now = this.ctx.currentTime;

    this.scheduleVoice('melody', this.themeData.melody, 'square', 0.18, now + lookAhead);
    this.scheduleVoice('harmony', this.themeData.harmony, 'square', 0.10, now + lookAhead);
    this.scheduleVoice('bass', this.themeData.bass, 'triangle', 0.22, now + lookAhead);
    this.schedulePerc(now + lookAhead);
  }

  private scheduleVoice(
    voice: string,
    notes: NoteEntry[],
    waveType: OscillatorType,
    gainLevel: number,
    until: number,
  ) {
    if (!this.ctx || !this.masterGain) return;
    const td = this.themeData!;
    const beatDur = 60 / td.bpm;

    while (this.voiceBeatTime[voice] < until) {
      const idx = this.voiceIndex[voice] % notes.length;
      const [noteName, beats] = notes[idx];
      const startTime = this.voiceBeatTime[voice];
      const duration = beats * beatDur;

      if (noteName && N[noteName]) {
        this.playTone(N[noteName], startTime, duration * 0.9, waveType, gainLevel, voice === 'melody');
      }

      this.voiceBeatTime[voice] += duration;
      this.voiceIndex[voice] = idx + 1;
    }
  }

  private playTone(
    freq: number,
    startTime: number,
    duration: number,
    waveType: OscillatorType,
    gainLevel: number,
    vibrato: boolean,
  ) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle vibrato on melody
    if (vibrato && duration > 0.15) {
      const vibOsc = ctx.createOscillator();
      const vibGain = ctx.createGain();
      vibOsc.frequency.value = 5.5; // Hz
      vibGain.gain.value = freq * 0.008; // subtle pitch wobble
      vibOsc.connect(vibGain);
      vibGain.connect(osc.frequency);
      vibOsc.start(startTime + duration * 0.3); // start vibrato after attack
      vibOsc.stop(startTime + duration);
    }

    // Envelope: quick attack, sustain, quick release
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.008);
    gain.gain.setValueAtTime(gainLevel, startTime + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);

    this.activeNodes.push(osc);
    osc.onended = () => {
      const i = this.activeNodes.indexOf(osc);
      if (i >= 0) this.activeNodes.splice(i, 1);
    };
  }

  private schedulePerc(until: number) {
    if (!this.ctx || !this.masterGain || !this.themeData) return;
    const td = this.themeData;
    const beatDur = 60 / td.bpm;

    while (this.voiceBeatTime.perc < until) {
      const idx = this.voiceIndex.perc % td.perc.length;
      const [type, beats] = td.perc[idx];
      const startTime = this.voiceBeatTime.perc;
      const duration = beats * beatDur;

      if (type === 'kick') this.playKick(startTime);
      else if (type === 'snare') this.playSnare(startTime);
      else if (type === 'hat') this.playHat(startTime);

      this.voiceBeatTime.perc += duration;
      this.voiceIndex.perc = idx + 1;
    }
  }

  private playKick(time: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(time);
    osc.stop(time + 0.12);
    this.activeNodes.push(osc);
    osc.onended = () => {
      const i = this.activeNodes.indexOf(osc);
      if (i >= 0) this.activeNodes.splice(i, 1);
    };
  }

  private playSnare(time: number) {
    const ctx = this.ctx!;
    // Noise burst
    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    noise.start(time);
    noise.stop(time + 0.06);
    this.activeNodes.push(noise);
    noise.onended = () => {
      const i = this.activeNodes.indexOf(noise);
      if (i >= 0) this.activeNodes.splice(i, 1);
    };

    // Tonal body
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.04);
    oscGain.gain.setValueAtTime(0.12, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain!);
    osc.start(time);
    osc.stop(time + 0.04);
    this.activeNodes.push(osc);
  }

  private playHat(time: number) {
    const ctx = this.ctx!;
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    noise.start(time);
    noise.stop(time + 0.03);
    this.activeNodes.push(noise);
    noise.onended = () => {
      const i = this.activeNodes.indexOf(noise);
      if (i >= 0) this.activeNodes.splice(i, 1);
    };
  }

  stop() {
    this.playing = false;
    this.currentTheme = null;
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    // Stop all active nodes
    for (const node of this.activeNodes) {
      try { node.stop(); } catch { /* already stopped */ }
    }
    this.activeNodes = [];
  }

  fadeOut(durationMs = 500) {
    if (!this.masterGain || !this.ctx) {
      this.stop();
      return;
    }
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this._volume, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
    setTimeout(() => {
      this.stop();
      if (this.masterGain) {
        this.masterGain.gain.value = this._volume;
      }
    }, durationMs + 50);
  }

  isPlaying() { return this.playing; }
  getCurrentTheme() { return this.currentTheme; }

  destroy() {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
    this.ctx = null;
    this.masterGain = null;
  }
}

// Singleton for the app
let _engine: ChiptuneEngine | null = null;
export function getChiptuneEngine(): ChiptuneEngine {
  if (!_engine) _engine = new ChiptuneEngine();
  return _engine;
}

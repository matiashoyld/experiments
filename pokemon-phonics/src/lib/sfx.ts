// Simple Web Audio API sound effects — Pokemon-style chiptune SFX
// All generated programmatically, no audio files needed.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume: number = 0.15,
  rampDown: boolean = true,
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  if (rampDown) {
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  }
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

/** Short rising chirp — correct answer / button press */
export function sfxCorrect() {
  const c = getCtx();
  const now = c.currentTime;
  // Two-note rising chirp
  [523, 784].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + i * 0.1 + 0.1);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.15);
  });
}

/** Descending boop — wrong answer */
export function sfxWrong() {
  const c = getCtx();
  const now = c.currentTime;
  [392, 262].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.15);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.2);
  });
}

/** Button tap — short click sound */
export function sfxTap() {
  playTone(800, 0.05, 'square', 0.08);
}

/** Pokeball throw whoosh — noise sweep */
export function sfxThrow() {
  const c = getCtx();
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
  gain.gain.value = 0.08;
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}

/** Pokeball shake — rattling sound */
export function sfxShake() {
  const c = getCtx();
  const now = c.currentTime;
  [600, 500, 600].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.06;
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.06);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.08);
  });
}

/** Pokeball catch click — satisfying "click!" */
export function sfxCatch() {
  const c = getCtx();
  const now = c.currentTime;
  playTone(1200, 0.05, 'square', 0.15);
  // Followed by a short celebration arpeggio
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + i * 0.08 + 0.12);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + 0.1 + i * 0.08);
    osc.stop(now + 0.1 + i * 0.08 + 0.15);
  });
}

/** Pokemon fled — sad descending */
export function sfxFled() {
  const c = getCtx();
  const now = c.currentTime;
  [523, 440, 349, 262].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.2);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.25);
  });
}

/** Battle encounter — dramatic stinger */
export function sfxEncounter() {
  const c = getCtx();
  const now = c.currentTime;
  // Quick dramatic rising notes
  [330, 440, 554, 659, 880].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.1);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.12);
  });
}

/** XP gain — quick ascending sparkle */
export function sfxXP() {
  const c = getCtx();
  const now = c.currentTime;
  [880, 1047, 1319].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.1);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.12);
  });
}

export interface Attempt {
  correct: boolean;
  timestamp: number;
  responseTimeMs: number;
  challengeType: string;
}

export function calculateMastery(attempts: Attempt[], windowSize = 10): number {
  if (attempts.length === 0) return 0;
  const recent = attempts.slice(-windowSize);
  const correct = recent.filter(a => a.correct).length;
  return correct / recent.length;
}

export function getAverageResponseTime(attempts: Attempt[], windowSize = 10): number {
  if (attempts.length === 0) return Infinity;
  const recent = attempts.slice(-windowSize);
  const total = recent.reduce((sum, a) => sum + a.responseTimeMs, 0);
  return total / recent.length;
}

export function isMastered(attempts: Attempt[]): boolean {
  return calculateMastery(attempts) >= 0.8;
}

export function isInstantRecall(attempts: Attempt[]): boolean {
  return getAverageResponseTime(attempts) < 3000;
}

export function isShinyEligible(attempts: Attempt[]): boolean {
  if (attempts.length < 20) return false;
  const last20 = attempts.slice(-20);
  return last20.every(a => a.correct);
}

// XP thresholds for evolution
export const EVOLUTION_XP = {
  stage2: 20, // 20 correct CVC word readings
  stage3: 30, // 30 correct sentence readings
};

export function getEvolutionStage(xp: number): 1 | 2 | 3 {
  if (xp >= EVOLUTION_XP.stage2 + EVOLUTION_XP.stage3) return 3;
  if (xp >= EVOLUTION_XP.stage2) return 2;
  return 1;
}

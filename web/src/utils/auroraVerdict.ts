export type AuroraVerdictLevel = 'go' | 'maybe' | 'nogo';

export interface AuroraVerdict {
  level: AuroraVerdictLevel;
  score: number;
}

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

/** Combines Kp, IMF Bz (nT) and solar wind speed (km/s) into a 0-100 activity score and verdict. */
export const getAuroraVerdict = (kp: number, bz: number, speed: number): AuroraVerdict => {
  const kpPart = clamp((kp / 6) * 60);
  const bzPart = clamp((-bz / 10) * 25);
  const speedPart = clamp(((speed - 300) / 400) * 15);
  const score = Math.round(clamp(kpPart + bzPart + speedPart));
  const level: AuroraVerdictLevel = score >= 55 ? 'go' : score >= 30 ? 'maybe' : 'nogo';
  return { level, score };
};

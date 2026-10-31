export type DisturbanceStatus = 'HIGH' | 'MODERATE' | 'LOW' | 'QUIET';

// Horizontal-field deviation (nT) from the station's 24h median.
export const DISTURBANCE_THRESHOLDS = { low: 30, moderate: 100, high: 250 } as const;

export const classifyDisturbance = (nanotesla: number): DisturbanceStatus => {
  if (nanotesla >= DISTURBANCE_THRESHOLDS.high) return 'HIGH';
  if (nanotesla >= DISTURBANCE_THRESHOLDS.moderate) return 'MODERATE';
  if (nanotesla >= DISTURBANCE_THRESHOLDS.low) return 'LOW';
  return 'QUIET';
};

export type Trend = 'rising' | 'falling' | 'steady';

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

/**
 * Compares the last 30 minutes of disturbance with the 30 minutes before it.
 * Needs at least two samples in each window, otherwise the trend is unknown.
 */
export const computeTrend = (
  samples: { timestamp: number; disturbance: number }[],
): Trend | null => {
  if (samples.length === 0) return null;
  const end = Math.max(...samples.map((s) => s.timestamp));
  const window = 30 * 60 * 1000;
  const recent = samples.filter((s) => s.timestamp > end - window).map((s) => s.disturbance);
  const previous = samples
    .filter((s) => s.timestamp <= end - window && s.timestamp > end - 2 * window)
    .map((s) => s.disturbance);
  if (recent.length < 2 || previous.length < 2) return null;

  const before = mean(previous);
  const now = mean(recent);
  const change = now - before;
  // Ignore wobble: needs 20 nT and 25% movement to count as a trend.
  if (Math.abs(change) < 20 || Math.abs(change) < before * 0.25) return 'steady';
  return change > 0 ? 'rising' : 'falling';
};

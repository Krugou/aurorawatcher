import { describe, expect, it } from 'vitest';

import { classifyDisturbance, computeTrend } from '../../utils/disturbance';

const MIN = 60 * 1000;
const series = (values: number[]) =>
  values.map((disturbance, i) => ({ timestamp: i * 10 * MIN, disturbance }));

describe('classifyDisturbance', () => {
  it('maps nanotesla to a status', () => {
    expect(classifyDisturbance(5)).toBe('QUIET');
    expect(classifyDisturbance(30)).toBe('LOW');
    expect(classifyDisturbance(120)).toBe('MODERATE');
    expect(classifyDisturbance(400)).toBe('HIGH');
  });
});

describe('computeTrend', () => {
  it('detects rising activity', () => {
    expect(computeTrend(series([10, 12, 11, 60, 90, 120]))).toBe('rising');
  });

  it('detects falling activity', () => {
    expect(computeTrend(series([300, 280, 290, 90, 60, 40]))).toBe('falling');
  });

  it('ignores small wobble', () => {
    expect(computeTrend(series([100, 105, 98, 102, 99, 104]))).toBe('steady');
  });

  it('returns null without enough samples', () => {
    expect(computeTrend([])).toBeNull();
    expect(computeTrend(series([10, 20]))).toBeNull();
  });
});

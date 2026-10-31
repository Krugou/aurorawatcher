import { describe, expect, it } from 'vitest';

import { buildNightTimeline, computeVerdict } from '../../utils/verdict';

// Rovaniemi area in mid-December: polar night, so 22:00 UTC is fully dark.
const base = { lat: 66.5, lon: 25.7, fieldStatus: 'HIGH' as const, kp: 6, bz: -8 };
const DARK = new Date('2026-12-15T22:00:00Z');
const NOON = new Date('2026-06-21T10:00:00Z');

describe('computeVerdict', () => {
  it('is daylight when the sun is up regardless of activity', () => {
    const verdict = computeVerdict({ ...base, date: NOON, cloudCover: 0 });
    expect(verdict.level).toBe('daylight');
    expect(verdict.score).toBe(0);
  });

  it('is no-go under heavy cloud even with a storm', () => {
    const verdict = computeVerdict({ ...base, date: DARK, cloudCover: 90 });
    expect(verdict.level).toBe('nogo');
    expect(verdict.limiting).toBe('cloud');
  });

  it('never says go when the field is quiet', () => {
    const verdict = computeVerdict({
      ...base,
      date: DARK,
      cloudCover: 0,
      fieldStatus: 'QUIET',
      kp: 1,
      bz: 2,
    });
    expect(verdict.level).not.toBe('go');
    expect(verdict.activity).toBeLessThan(0.5);
  });

  it('only says go when the sky lets the aurora through', () => {
    const verdict = computeVerdict({ ...base, date: DARK, cloudCover: 5 });
    expect(verdict.factors.darkness).toBeGreaterThan(0.9);
    if (verdict.level === 'go') {
      expect(verdict.visibility).toBeGreaterThanOrEqual(0.5);
      expect(verdict.limiting).toBe('none');
    }
  });

  it('penalises low latitudes unless Kp is high', () => {
    const north = computeVerdict({ ...base, date: DARK, cloudCover: 0, kp: 3, bz: 0 });
    const south = computeVerdict({ ...base, lat: 60, date: DARK, cloudCover: 0, kp: 3, bz: 0 });
    expect(south.activity).toBeLessThan(north.activity);
  });
});

describe('buildNightTimeline', () => {
  it('scores hours using forecast cloud cover and finds the clearest window', () => {
    const now = new Date('2026-12-15T15:30:00Z');
    const forecast = Array.from({ length: 18 }, (_, i) => ({
      time: Date.UTC(2026, 11, 15, 16 + i),
      cloudCover: i >= 4 && i <= 6 ? 0 : 95,
    }));
    const timeline = buildNightTimeline(base, 95, forecast, now, 18);

    expect(timeline.slots).toHaveLength(18);
    expect(timeline.slots[0].time).toBe(Date.UTC(2026, 11, 15, 16));
    expect(timeline.best).not.toBeNull();
    expect(timeline.best!.start).toBeGreaterThanOrEqual(Date.UTC(2026, 11, 15, 20));
    expect(timeline.best!.end).toBeLessThanOrEqual(Date.UTC(2026, 11, 15, 23));
  });

  it('reports no window when nothing is worth it', () => {
    const now = new Date('2026-12-15T15:30:00Z');
    const timeline = buildNightTimeline(base, 100, [], now, 12);
    expect(timeline.best).toBeNull();
  });
});

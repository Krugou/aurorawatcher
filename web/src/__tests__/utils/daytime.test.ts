import { describe, expect, it, vi } from 'vitest';

// We need to mock SunCalc before importing the module
vi.mock('suncalc', () => ({
  default: {
    getTimes: vi.fn(),
    getPosition: vi.fn(),
  },
}));

import SunCalc from 'suncalc';

import { isDaytime } from '../../utils/daytime';

describe('isDaytime', () => {
  it('returns true when current time is between sunrise and sunset', () => {
    const now = new Date();
    const sunrise = new Date(now.getTime() - 3600000); // 1 hour ago
    const sunset = new Date(now.getTime() + 3600000); // 1 hour from now

    vi.mocked(SunCalc.getTimes).mockReturnValue({
      sunrise,
      sunset,
    } as ReturnType<typeof SunCalc.getTimes>);

    expect(isDaytime(60.17, 24.94)).toBe(true);
  });

  it('returns false when current time is after sunset', () => {
    const now = new Date();
    const sunrise = new Date(now.getTime() - 7200000); // 2 hours ago
    const sunset = new Date(now.getTime() - 3600000); // 1 hour ago

    vi.mocked(SunCalc.getTimes).mockReturnValue({
      sunrise,
      sunset,
    } as ReturnType<typeof SunCalc.getTimes>);

    expect(isDaytime(60.17, 24.94)).toBe(false);
  });

  it('returns false when current time is before sunrise', () => {
    const now = new Date();
    const sunrise = new Date(now.getTime() + 3600000); // 1 hour from now
    const sunset = new Date(now.getTime() + 7200000); // 2 hours from now

    vi.mocked(SunCalc.getTimes).mockReturnValue({
      sunrise,
      sunset,
    } as ReturnType<typeof SunCalc.getTimes>);

    expect(isDaytime(60.17, 24.94)).toBe(false);
  });

  it('handles polar night (no sunrise/sunset) — sun below horizon', () => {
    vi.mocked(SunCalc.getTimes).mockReturnValue({
      sunrise: undefined,
      sunset: undefined,
    } as unknown as ReturnType<typeof SunCalc.getTimes>);

    // Sun altitude well below horizon
    vi.mocked(SunCalc.getPosition).mockReturnValue({
      altitude: -0.5, // deep below horizon
      azimuth: 0,
    });

    expect(isDaytime(69.76, 27.01)).toBe(false);
  });

  it('handles midnight sun (no sunrise/sunset) — sun above horizon', () => {
    vi.mocked(SunCalc.getTimes).mockReturnValue({
      sunrise: undefined,
      sunset: undefined,
    } as unknown as ReturnType<typeof SunCalc.getTimes>);

    // Sun clearly above horizon
    vi.mocked(SunCalc.getPosition).mockReturnValue({
      altitude: 0.3,
      azimuth: 0,
    });

    expect(isDaytime(69.76, 27.01)).toBe(true);
  });

  it('handles civil twilight boundary (altitude = -0.1)', () => {
    vi.mocked(SunCalc.getTimes).mockReturnValue({
      sunrise: undefined,
      sunset: undefined,
    } as unknown as ReturnType<typeof SunCalc.getTimes>);

    // Exactly at the threshold
    vi.mocked(SunCalc.getPosition).mockReturnValue({
      altitude: -0.1,
      azimuth: 0,
    });

    expect(isDaytime(69.76, 27.01)).toBe(false);
  });
});

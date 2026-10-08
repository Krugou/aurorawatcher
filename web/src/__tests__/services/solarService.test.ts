import { afterEach, describe, expect, it, vi } from 'vitest';

vi.unmock('../../services/solarService');

import { fetchSolarData, fetchSolarHistory } from '../../services/solarService';

afterEach(() => vi.unstubAllGlobals());

describe('fetchSolarData', () => {
  it('parses current NOAA geospace and Kp observations', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve([
              ['time_tag', 'speed', 'density', 'temperature', 'bx', 'by', 'bz'],
              ['2026-10-08T04:00:00Z', 420, 5.2, 50000, 1, 2, -3.4],
            ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve([
              { time_tag: '2026-10-08T03:59:00Z', estimated_kp: 2.33 },
              { time_tag: '2026-10-08T04:00:00Z', estimated_kp: 3.33 },
            ]),
        }),
    );

    await expect(fetchSolarData()).resolves.toEqual({
      bz: -3.4,
      speed: 420,
      density: 5.2,
      kp: 3.33,
      timestamp: '2026-10-08T04:00:00Z',
    });
  });

  it('returns null for empty NOAA data', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([['time_tag']]) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }),
    );
    await expect(fetchSolarData()).resolves.toBeNull();
  });

  it('throws when an endpoint fails so the UI can show an error and retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(fetchSolarData()).rejects.toThrow('NOAA request failed (404)');
  });
});

describe('fetchSolarHistory', () => {
  it('parses and sorts NOAA geospace history', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            ['time_tag', 'speed', 'density', 'temperature', 'bx', 'by', 'bz'],
            ['2026-10-08T00:01:00Z', 450, 6, 60000, 1, 2, -2.5],
            ['2026-10-08T00:00:00Z', 400, 5, 50000, 1, 2, -3],
          ]),
      }),
    );

    const result = await fetchSolarHistory();
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ bz: -3, speed: 400, density: 5 });
    expect(result[0].timestamp).toBeLessThan(result[1].timestamp);
  });

  it('filters invalid rows and returns an empty array for a valid empty product', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([['time_tag', 'speed']]) }),
    );
    await expect(fetchSolarHistory()).resolves.toEqual([]);
  });

  it('throws on fetch failure so the UI can show an error and retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(fetchSolarHistory()).rejects.toThrow('NOAA request failed (500)');
  });
});

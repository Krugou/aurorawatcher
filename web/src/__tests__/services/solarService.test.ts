import { describe, expect, it, vi } from 'vitest';

// Unmock the solarService so we test the actual module
vi.unmock('../../services/solarService');

// Mock proxy
vi.mock('../../utils/proxy', () => ({
  buildProxyUrl: vi.fn((url: string) => url),
}));

import { fetchSolarData, fetchSolarHistory } from '../../services/solarService';

describe('fetchSolarData', () => {
  it('returns parsed solar data on successful fetch', async () => {
    const magData = [
      ['time_tag', 'bx_gsm', 'by_gsm', 'bz_gsm', 'lon_gsm', 'lat_gsm', 'bt'],
      ['2024-01-01 00:00:00.000', '1.2', '-0.5', '-3.4', '10', '20', '5.0'],
    ];
    const plasmaData = [
      ['time_tag', 'density', 'speed', 'temperature'],
      ['2024-01-01 00:00:00.000', '5.2', '420', '50000'],
    ];
    const kpData = [
      ['time_tag', 'kp_index', 'a_index'],
      ['2024-01-01 00:00:00.000', '3.33', '15'],
    ];

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(magData) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(plasmaData) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(kpData) }),
    );

    const result = await fetchSolarData();

    expect(result).not.toBeNull();
    expect(result!.bz).toBe(-3.4);
    expect(result!.speed).toBe(420);
    expect(result!.density).toBe(5.2);
    expect(result!.kp).toBe(3.33);
    expect(result!.timestamp).toBe('2024-01-01 00:00:00.000');
  });

  it('returns null when a fetch request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }),
    );

    const result = await fetchSolarData();
    expect(result).toBeNull();
  });

  it('returns null when data arrays are too short', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([['header']]) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([['header']]) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([['header']]) }),
    );

    const result = await fetchSolarData();
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const result = await fetchSolarData();
    expect(result).toBeNull();
  });
});

describe('fetchSolarHistory', () => {
  it('returns sorted array of solar history points', async () => {
    const magData = [
      ['time_tag', 'bx', 'by', 'bz', 'lon', 'lat', 'bt'],
      ['2024-01-01T00:00:00Z', '1', '2', '-3.0', '0', '0', '5'],
      ['2024-01-01T00:01:00Z', '1', '2', '-2.5', '0', '0', '5'],
    ];
    const plasmaData = [
      ['time_tag', 'density', 'speed', 'temperature'],
      ['2024-01-01T00:00:00Z', '5.0', '400', '50000'],
      ['2024-01-01T00:01:00Z', '6.0', '450', '60000'],
    ];

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(magData) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(plasmaData) }),
    );

    const result = await fetchSolarHistory();

    expect(result).toHaveLength(2);
    expect(result[0].bz).toBe(-3.0);
    expect(result[0].speed).toBe(400);
    expect(result[0].density).toBe(5.0);
    expect(result[1].bz).toBe(-2.5);
    // Sorted by timestamp
    expect(result[0].timestamp).toBeLessThan(result[1].timestamp);
  });

  it('returns empty array on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' })
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Error' }),
    );

    const result = await fetchSolarHistory();
    expect(result).toEqual([]);
  });

  it('returns empty array on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));

    const result = await fetchSolarHistory();
    expect(result).toEqual([]);
  });

  it('filters out incomplete data points', async () => {
    const magData = [
      ['time_tag', 'bx', 'by', 'bz', 'lon', 'lat', 'bt'],
      ['2024-01-01T00:00:00Z', '1', '2', '-3.0', '0', '0', '5'],
      ['2024-01-01T00:01:00Z', '1', '2', '-2.5', '0', '0', '5'],
    ];
    // Only one plasma entry (the other mag entry has no matching plasma)
    const plasmaData = [
      ['time_tag', 'density', 'speed', 'temperature'],
      ['2024-01-01T00:00:00Z', '5.0', '400', '50000'],
    ];

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(magData) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(plasmaData) }),
    );

    const result = await fetchSolarHistory();
    // Only the matched entry should be included
    expect(result).toHaveLength(1);
    expect(result[0].bz).toBe(-3.0);
  });
});

import { describe, expect, it, vi } from 'vitest';

// Unmock the weather service
vi.unmock('../../services/weatherService');

import { fetchNorwayWeather, WeatherError } from '../../services/weatherService';

describe('fetchNorwayWeather', () => {
  it('returns weather data for valid coordinates', async () => {
    const mockResponse = {
      properties: {
        timeseries: [
          {
            data: {
              instant: {
                details: {
                  air_temperature: -5.2,
                },
              },
              next_1_hours: {
                summary: {
                  symbol_code: 'partly_cloudy_night',
                },
              },
            },
          },
        ],
      },
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    );

    const result = await fetchNorwayWeather(60.17, 24.94);

    expect(result.temperature).toBe(-5.2);
    expect(result.description).toBe('partly cloudy night');
    expect(result.location).toBe('60.17, 24.94');
    expect(result.icon).toBe('partly_cloudy_night');
  });

  it('throws WeatherError for invalid coordinates (NaN)', async () => {
    await expect(fetchNorwayWeather(NaN, 24.94)).rejects.toThrow(WeatherError);
    await expect(fetchNorwayWeather(NaN, 24.94)).rejects.toThrow('Invalid coordinates');
  });

  it('throws WeatherError for non-number coordinates', async () => {
    await expect(fetchNorwayWeather('abc' as unknown as number, 24.94)).rejects.toThrow(
      WeatherError,
    );
  });

  it('throws WeatherError on API error status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    await expect(fetchNorwayWeather(60.17, 24.94)).rejects.toThrow('Weather API error: 503');
  });

  it('throws WeatherError when timeseries is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ properties: { timeseries: [] } }),
      }),
    );

    await expect(fetchNorwayWeather(60.17, 24.94)).rejects.toThrow('No weather data available');
  });

  it('throws WeatherError when weather details are missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            properties: {
              timeseries: [{ data: { instant: {} } }],
            },
          }),
      }),
    );

    await expect(fetchNorwayWeather(60.17, 24.94)).rejects.toThrow('Weather details missing');
  });

  it('handles missing next_1_hours summary gracefully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            properties: {
              timeseries: [
                {
                  data: {
                    instant: { details: { air_temperature: 3.0 } },
                    // No next_1_hours
                  },
                },
              ],
            },
          }),
      }),
    );

    const result = await fetchNorwayWeather(60.17, 24.94);
    expect(result.description).toBe('Unknown');
    expect(result.icon).toBe('');
  });

  it('wraps generic errors in WeatherError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('DNS failed')));

    await expect(fetchNorwayWeather(60.17, 24.94)).rejects.toThrow(WeatherError);
    await expect(fetchNorwayWeather(60.17, 24.94)).rejects.toThrow('Failed to fetch weather');
  });
});

describe('WeatherError', () => {
  it('is an instance of Error', () => {
    const error = new WeatherError('test');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('WeatherError');
    expect(error.message).toBe('test');
  });
});

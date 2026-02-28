import { describe, expect, it, vi } from 'vitest';

// Unmock fmiService
vi.unmock('../../services/fmiService');

import {
  fetchMagneticData,
  fetchMagnetometerHistory,
  fetchWeatherData,
} from '../../services/fmiService';

// Helper to create a mock XML response for magnetometer data
const createMagXml = (_station: string, values: Record<string, string>) => {
  const members = Object.entries(values)
    .map(
      ([param, val]) => `
    <wfs:member>
      <BsWfs:BsWfsElement>
        <BsWfs:Location>
          <gml:Point><gml:pos>60.51 24.65</gml:pos></gml:Point>
        </BsWfs:Location>
        <BsWfs:Time>2024-01-01T00:00:00Z</BsWfs:Time>
        <BsWfs:ParameterName>${param}</BsWfs:ParameterName>
        <BsWfs:ParameterValue>${val}</BsWfs:ParameterValue>
      </BsWfs:BsWfsElement>
    </wfs:member>`,
    )
    .join('');

  return `<?xml version="1.0"?>
    <wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:BsWfs="http://xml.fmi.fi/schema/wfs/2.0" xmlns:gml="http://www.opengis.net/gml/3.2">
      ${members}
    </wfs:FeatureCollection>`;
};

describe('fetchMagneticData', () => {
  it('returns parsed magnetic data from FMI XML response', async () => {
    const xml = createMagXml('NUR', {
      MAGN_X: '15000',
      MAGN_Y: '1500',
      MAGN_Z: '50000',
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(xml),
      }),
    );

    const result = await fetchMagneticData(60.51, 24.65);

    expect(result).not.toBeNull();
    if (result) {
      expect(result.components.x).toBe(15000);
      expect(result.components.y).toBe(1500);
      expect(result.components.z).toBe(50000);
    }
  });

  it('returns null on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const result = await fetchMagneticData(60.51, 24.65);
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const result = await fetchMagneticData(60.51, 24.65);
    expect(result).toBeNull();
  });
});

describe('fetchMagnetometerHistory', () => {
  it('returns array of graph data points on success', async () => {
    const xml = createMagXml('NUR', {
      MAGN_X: '15000',
      MAGN_Y: '1500',
      MAGN_Z: '50000',
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(xml),
      }),
    );

    const result = await fetchMagnetometerHistory(60.51, 24.65);
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns empty array on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed')));

    const result = await fetchMagnetometerHistory(60.51, 24.65);
    expect(result).toEqual([]);
  });
});

describe('fetchWeatherData', () => {
  it('returns null on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed')));

    const result = await fetchWeatherData(60.51, 24.65);
    expect(result).toBeNull();
  });

  it('returns null when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    const result = await fetchWeatherData(60.51, 24.65);
    expect(result).toBeNull();
  });
});

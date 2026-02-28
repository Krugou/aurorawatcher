import { describe, expect, it, vi } from 'vitest';

import {
  AURORA_COLORS,
  checkImageColor,
  findNearestStation,
  scanStationStatuses,
  STATION_COORDINATES,
} from '../../utils/auroraUtils';

// ─── AURORA_COLORS constant ──────────────────────────────────────────────────
describe('AURORA_COLORS', () => {
  it('defines high and low color objects', () => {
    expect(AURORA_COLORS.high).toEqual({ red: 238, green: 102, blue: 119 });
    expect(AURORA_COLORS.low).toEqual({ red: 204, green: 187, blue: 68 });
  });
});

// ─── STATION_COORDINATES ─────────────────────────────────────────────────────
describe('STATION_COORDINATES', () => {
  it('contains all 12 known Finnish magnetometer stations', () => {
    const stationNames = Object.keys(STATION_COORDINATES);
    expect(stationNames).toHaveLength(12);
    expect(stationNames).toContain('Kevo');
    expect(stationNames).toContain('Nurmijärvi');
    expect(stationNames).toContain('Tartto');
  });

  it('has valid coordinate ranges for every station', () => {
    Object.entries(STATION_COORDINATES).forEach(([name, c]) => {
      expect(c.x, `${name}.x`).toBeGreaterThanOrEqual(0);
      expect(c.x, `${name}.x`).toBeLessThanOrEqual(1);
      expect(c.y, `${name}.y`).toBeGreaterThanOrEqual(0);
      expect(c.y, `${name}.y`).toBeLessThanOrEqual(1);
      expect(c.lat, `${name}.lat`).toBeGreaterThanOrEqual(55);
      expect(c.lat, `${name}.lat`).toBeLessThanOrEqual(72);
      expect(c.lon, `${name}.lon`).toBeGreaterThanOrEqual(18);
      expect(c.lon, `${name}.lon`).toBeLessThanOrEqual(32);
    });
  });
});

// ─── findNearestStation ──────────────────────────────────────────────────────
describe('findNearestStation', () => {
  it('returns Nurmijärvi for Helsinki coordinates', () => {
    const station = findNearestStation(60.17, 24.94);
    expect(station).toBe('Nurmijärvi');
  });

  it('returns Kevo for northernmost point in Finland', () => {
    const station = findNearestStation(70.08, 27.01);
    expect(station).toBe('Kevo');
  });

  it('returns Sodankylä for coordinates near Sodankylä', () => {
    const station = findNearestStation(67.42, 26.59);
    expect(station).toBe('Sodankylä');
  });

  it('returns the closest station by Haversine distance', () => {
    // Tartto coordinates directly
    const station = findNearestStation(58.26, 26.46);
    expect(station).toBe('Tartto');
  });

  it('returns null-safe result (always returns a station name)', () => {
    const station = findNearestStation(0, 0);
    expect(station).not.toBeNull();
    expect(typeof station).toBe('string');
  });
});

// ─── scanStationStatuses (mocked canvas) ─────────────────────────────────────
describe('scanStationStatuses', () => {
  const createMockImage = (width: number, height: number, pixelData: Uint8ClampedArray) => {
    const mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: pixelData })),
    };
    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: () => mockContext,
      width: 0,
      height: 0,
    } as unknown as HTMLElement);

    return { width, height } as HTMLImageElement;
  };

  it('returns an array of station statuses', () => {
    // Create pixel data that fills with QUIET grey (215, 215, 215)
    const w = 100;
    const h = 100;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 215; // R
      data[i + 1] = 215; // G
      data[i + 2] = 215; // B
      data[i + 3] = 255; // A
    }
    const img = createMockImage(w, h, data);
    const results = scanStationStatuses(img);

    expect(results).toHaveLength(12);
    results.forEach((r) => {
      expect(r).toHaveProperty('name');
      expect(r).toHaveProperty('color');
      expect(r).toHaveProperty('status');
    });
  });

  it('detects QUIET status for grey pixels', () => {
    const w = 100;
    const h = 100;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 215;
      data[i + 1] = 215;
      data[i + 2] = 215;
      data[i + 3] = 255;
    }
    const img = createMockImage(w, h, data);
    const results = scanStationStatuses(img);

    // All stations should be QUIET with grey background
    results.forEach((r) => {
      expect(r.status).toBe('QUIET');
      expect(r.color).toBe('#D7D7D7');
    });
  });

  it('returns empty array when canvas context is null', () => {
    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: () => null,
      width: 0,
      height: 0,
    } as unknown as HTMLElement);

    const img = { width: 100, height: 100 } as HTMLImageElement;
    const results = scanStationStatuses(img);
    expect(results).toEqual([]);
  });
});

// ─── checkImageColor ─────────────────────────────────────────────────────────
describe('checkImageColor', () => {
  it('returns hasHigh=false and hasLow=false for quiet grey image', () => {
    const w = 100;
    const h = 100;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 215;
      data[i + 1] = 215;
      data[i + 2] = 215;
      data[i + 3] = 255;
    }
    const mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data })),
    };
    vi.spyOn(document, 'createElement').mockReturnValue({
      getContext: () => mockContext,
      width: 0,
      height: 0,
    } as unknown as HTMLElement);

    const img = { width: w, height: h } as HTMLImageElement;
    const result = checkImageColor(img);
    expect(result.hasHigh).toBe(false);
    expect(result.hasLow).toBe(false);
  });
});

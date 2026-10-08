import { describe, expect, it } from 'vitest';

import { analyzeAuroraPixels } from './auroraColorDetection';

const pixels = (...colors: Array<[number, number, number, number]>) =>
  new Uint8ClampedArray(colors.flat());

describe('analyzeAuroraPixels', () => {
  it('detects saturated green, purple, and red aurora colors', () => {
    const data = pixels(
      ...Array.from({ length: 30 }, () => [30, 240, 90, 255] as [number, number, number, number]),
      ...Array.from({ length: 30 }, () => [190, 40, 240, 255] as [number, number, number, number]),
      ...Array.from({ length: 30 }, () => [240, 40, 35, 255] as [number, number, number, number]),
      ...Array.from({ length: 10 }, () => [30, 30, 30, 255] as [number, number, number, number]),
    );

    expect(analyzeAuroraPixels(data)).toMatchObject({
      greenPixels: 30,
      purplePixels: 30,
      redPixels: 30,
      hasAurora: true,
      score: 90,
    });
  });

  it('ignores gray pixels and transparent colors', () => {
    const data = pixels(
      ...Array.from({ length: 50 }, () => [150, 150, 150, 255] as [number, number, number, number]),
      ...Array.from({ length: 50 }, () => [30, 240, 90, 0] as [number, number, number, number]),
    );

    expect(analyzeAuroraPixels(data)).toMatchObject({
      auroraPixels: 0,
      auroraRatio: 0,
      hasAurora: false,
    });
  });

  it('requires a minimum number and ratio of colored pixels', () => {
    const data = pixels(
      ...Array.from({ length: 23 }, () => [30, 240, 90, 255] as [number, number, number, number]),
      ...Array.from({ length: 77 }, () => [30, 30, 30, 255] as [number, number, number, number]),
    );

    expect(analyzeAuroraPixels(data)).toMatchObject({ auroraPixels: 23, hasAurora: false });
  });
});

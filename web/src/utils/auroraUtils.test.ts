import { afterEach, describe, expect, it, vi } from 'vitest';

import { AURORA_COLORS, checkImageColor } from './auroraUtils';

describe('auroraUtils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false for both if context is null', () => {
    const img = document.createElement('img');
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const result = checkImageColor(img);
    expect(result).toEqual({ hasHigh: false, hasLow: false });
  });

  it('detects high activity color', () => {
    const img = document.createElement('img');
    img.width = 1;
    img.height = 1;

    const mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: [
          AURORA_COLORS.high.red,
          AURORA_COLORS.high.green,
          AURORA_COLORS.high.blue,
          255, // Alpha
        ],
      }),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);

    const result = checkImageColor(img);
    expect(result).toEqual({ hasHigh: true, hasLow: false });
  });

  it('detects low activity color', () => {
    const img = document.createElement('img');
    img.width = 1;
    img.height = 1;

    const mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: [AURORA_COLORS.low.red, AURORA_COLORS.low.green, AURORA_COLORS.low.blue, 255],
      }),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);

    const result = checkImageColor(img);
    expect(result).toEqual({ hasHigh: false, hasLow: true });
  });

  it('detects nothing if colors do not match', () => {
    const img = document.createElement('img');
    img.width = 1;
    img.height = 1;

    const mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: [0, 0, 0, 255], // Black
      }),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);

    const result = checkImageColor(img);
    expect(result).toEqual({ hasHigh: false, hasLow: false });
  });
});

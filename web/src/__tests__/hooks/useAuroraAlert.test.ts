import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock the solar service before importing the hook
vi.mock('../../services/solarService', () => ({
  fetchSolarData: vi.fn(),
}));

import { useAuroraAlert } from '../../hooks/useAuroraAlert';
import { fetchSolarData } from '../../services/solarService';

describe('useAuroraAlert', () => {
  it('returns false initially (before data loads)', () => {
    vi.mocked(fetchSolarData).mockResolvedValue(null);
    const { result } = renderHook(() => useAuroraAlert());
    expect(result.current).toBe(false);
  });

  it('returns true when Kp >= 5 (geomagnetic storm)', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue({
      kp: 6,
      bz: 2,
      speed: 400,
      density: 5,
      timestamp: '2024-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useAuroraAlert());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('returns true when Bz <= -5 (strong southward IMF)', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue({
      kp: 2,
      bz: -8,
      speed: 400,
      density: 5,
      timestamp: '2024-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useAuroraAlert());

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('returns false when conditions are calm', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue({
      kp: 2,
      bz: 1,
      speed: 350,
      density: 3,
      timestamp: '2024-01-01T00:00:00Z',
    });

    const { result } = renderHook(() => useAuroraAlert());

    // Wait for async effect to complete
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current).toBe(false);
  });

  it('returns false when fetch returns null (error case)', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue(null);

    const { result } = renderHook(() => useAuroraAlert());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current).toBe(false);
  });

  it('handles fetch rejection gracefully', async () => {
    vi.mocked(fetchSolarData).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAuroraAlert());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    expect(result.current).toBe(false);
  });
});

import { ReactNode, createElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../services/solarService', () => ({ fetchSolarData: vi.fn() }));

import { SolarActivityProvider } from '../../context/SolarActivityProvider';
import { useAuroraAlert } from '../../hooks/useAuroraAlert';
import { fetchSolarData } from '../../services/solarService';

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(SolarActivityProvider, null, children);

describe('useAuroraAlert', () => {
  beforeEach(() => vi.mocked(fetchSolarData).mockReset());

  it('does not alert when solar data is unavailable', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue(null);
    const { result } = renderHook(() => useAuroraAlert(), { wrapper });
    await waitFor(() => expect(fetchSolarData).toHaveBeenCalledTimes(1));
    expect(result.current).toBe(false);
  });

  it('alerts when Kp reaches storm level', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue({
      kp: 5,
      bz: 2,
      speed: 400,
      density: 5,
      timestamp: '2024-01-01T00:00:00Z',
    });
    const { result } = renderHook(() => useAuroraAlert(), { wrapper });
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('alerts on strongly southward Bz even when Kp is low', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue({
      kp: 2,
      bz: -8,
      speed: 400,
      density: 5,
      timestamp: '2024-01-01T00:00:00Z',
    });
    const { result } = renderHook(() => useAuroraAlert(), { wrapper });
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('does not alert for calm values or unavailable data', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue({
      kp: 2,
      bz: 1,
      speed: 350,
      density: 3,
      timestamp: '2024-01-01T00:00:00Z',
    });
    const { result, rerender } = renderHook(() => useAuroraAlert(), { wrapper });
    await waitFor(() => expect(fetchSolarData).toHaveBeenCalledTimes(1));
    expect(result.current).toBe(false);
    rerender();
    expect(result.current).toBe(false);
  });
});

import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock proxy module
vi.mock('../../utils/proxy', () => ({
  buildProxyUrl: vi.fn((url: string) => `https://proxy.test/?url=${encodeURIComponent(url)}`),
}));

import { useImageMetadata } from '../../hooks/useImageMetadata';

describe('useImageMetadata', () => {
  it('returns null initially', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
      }),
    );

    const { result } = renderHook(() => useImageMetadata('https://example.com/img.jpg', 0));
    expect(result.current).toBeNull();
  });

  it('returns formatted time when Last-Modified header is present', async () => {
    const mockDate = new Date('2024-06-15T14:30:00Z');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({
          'Last-Modified': mockDate.toUTCString(),
        }),
      }),
    );

    const { result } = renderHook(() => useImageMetadata('https://example.com/img.jpg', 1));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    // The formatted time should be in fi-FI format (HH:MM)
    expect(result.current).toMatch(/^\d{1,2}[.:]\d{2}$/);
  });

  it('returns null when no Last-Modified header', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
      }),
    );

    const { result } = renderHook(() => useImageMetadata('https://example.com/img.jpg', 1));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current).toBeNull();
  });

  it('returns null on network error (CORS)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network error')));

    const { result } = renderHook(() => useImageMetadata('https://example.com/img.jpg', 1));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(result.current).toBeNull();
  });

  it('re-fetches when refreshTrigger changes', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = renderHook(
      ({ trigger }) => useImageMetadata('https://example.com/img.jpg', trigger),
      { initialProps: { trigger: 0 } },
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    const callCount = fetchMock.mock.calls.length;

    rerender({ trigger: 1 });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(fetchMock.mock.calls.length).toBeGreaterThan(callCount);
  });
});

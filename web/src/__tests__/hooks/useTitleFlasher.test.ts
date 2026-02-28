import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTitleFlasher } from '../../hooks/useTitleFlasher';

describe('useTitleFlasher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.title = 'Aurora Watcher';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not change title when inactive', () => {
    renderHook(() => {
      useTitleFlasher(false);
    });
    expect(document.title).toBe('Aurora Watcher');
  });

  it('flashes title message when active', () => {
    renderHook(() => {
      useTitleFlasher(true, ['🔴 ALERT!']);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(document.title).toBe('🔴 ALERT!');
  });

  it('cycles through multiple messages', () => {
    renderHook(() => {
      useTitleFlasher(true, ['MSG1', 'MSG2', 'MSG3']);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.title).toBe('MSG1');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.title).toBe('MSG2');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.title).toBe('MSG3');
  });

  it('restores original title when deactivated', () => {
    const { rerender } = renderHook(
      ({ active }) => {
        useTitleFlasher(active, ['🔴 ALERT!']);
      },
      { initialProps: { active: true } },
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(document.title).toBe('🔴 ALERT!');

    rerender({ active: false });
    expect(document.title).toBe('Aurora Watcher');
  });

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => {
      useTitleFlasher(true, ['🔴']);
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(document.title).toBe('Aurora Watcher');
  });
});

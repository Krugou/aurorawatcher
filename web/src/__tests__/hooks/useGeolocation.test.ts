import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGeolocation } from '../../hooks/useGeolocation';

describe('useGeolocation', () => {
  it('starts with null coords, no error, not loading', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.coords).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('sets loading=true when requestLocation is called', () => {
    const mockGetCurrentPosition = vi.fn();
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: mockGetCurrentPosition },
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.loading).toBe(true);
  });

  it('sets coords on successful geolocation', () => {
    const mockCoords = {
      latitude: 60.17,
      longitude: 24.94,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    };

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((success) => {
          success({ coords: mockCoords } as GeolocationPosition);
        }),
      },
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.coords).toEqual(mockCoords);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when geolocation fails', () => {
    const mockError = {
      code: 2,
      message: 'Position unavailable',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((_, errorCb) => {
          errorCb(mockError as GeolocationPositionError);
        }),
      },
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.coords).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('handles geolocation not supported', () => {
    vi.stubGlobal('navigator', {});

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Geolocation not supported');
  });
});

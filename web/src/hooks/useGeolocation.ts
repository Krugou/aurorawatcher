import { useState } from 'react';

interface GeolocationState {
  coords: GeolocationCoordinates | null;
  error: GeolocationPositionError | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: false,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: {
          code: 0,
          message: 'Geolocation not supported',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: position.coords,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState({
          coords: null,
          error,
          loading: false,
        });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 } // 10 minutes cache
    );
  };

  return { ...state, requestLocation };
};

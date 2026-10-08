import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../hooks/useGeolocation', () => ({
  useGeolocation: vi.fn(() => ({
    coords: null,
    requestLocation: vi.fn(),
    loading: false,
    error: null,
  })),
}));
vi.mock('../../services/fmiService', () => ({ fetchMagnetometerHistory: vi.fn() }));

import { MagnetometerGraph } from '../../components/MagnetometerGraph';
import { useGeolocation } from '../../hooks/useGeolocation';
import { fetchMagnetometerHistory } from '../../services/fmiService';

describe('MagnetometerGraph', () => {
  it('requests Helsinki history by default and offers explicit location selection', async () => {
    vi.mocked(fetchMagnetometerHistory).mockResolvedValue([]);
    render(React.createElement(MagnetometerGraph));

    await waitFor(() => {
      expect(fetchMagnetometerHistory).toHaveBeenCalledWith(60.1699, 24.9384);
    });
    expect(screen.getByText('graphs.defaultLocation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'graphs.useLocation' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error and retry action after an FMI request fails', async () => {
    vi.mocked(fetchMagnetometerHistory).mockRejectedValue(new Error('network error'));
    render(React.createElement(MagnetometerGraph));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'data_state.retry' })).toBeInTheDocument();
  });

  it('uses an explicitly selected location instead of Helsinki', async () => {
    const requestLocation = vi.fn();
    vi.mocked(useGeolocation).mockReturnValue({
      coords: { latitude: 65.0, longitude: 25.0 } as GeolocationCoordinates,
      requestLocation,
      loading: false,
      error: null,
    });
    vi.mocked(fetchMagnetometerHistory).mockResolvedValue([]);

    render(React.createElement(MagnetometerGraph));
    await waitFor(() => {
      expect(fetchMagnetometerHistory).toHaveBeenCalledWith(65, 25);
    });
    expect(screen.getByText('graphs.customLocation')).toBeInTheDocument();
    screen.getByRole('button', { name: 'graphs.useLocation' }).click();
    expect(requestLocation).toHaveBeenCalledOnce();
  });
});

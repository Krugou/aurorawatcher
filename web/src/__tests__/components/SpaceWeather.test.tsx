import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock fetchSolarData
vi.mock('../../services/solarService', () => ({
  fetchSolarData: vi.fn(),
}));

import { SpaceWeather } from '../../components/SpaceWeather';
import { SolarActivityProvider } from '../../context/SolarActivityProvider';
import { fetchSolarData } from '../../services/solarService';

const renderSpaceWeather = () =>
  render(
    <SolarActivityProvider>
      <SpaceWeather />
    </SolarActivityProvider>,
  );

describe('SpaceWeather', () => {
  it('shows skeletons while loading', () => {
    vi.mocked(fetchSolarData).mockReturnValue(new Promise(vi.fn())); // never resolves
    renderSpaceWeather();
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(4);
  });

  it('renders space weather data when loaded', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue({
      bz: -3.4,
      speed: 420,
      density: 5.2,
      kp: 3,
      timestamp: '2024-01-01T00:00:00Z',
    });

    renderSpaceWeather();

    // Wait for data to load
    expect(await screen.findByText('-3.4')).toBeInTheDocument();
    expect(screen.getByText('420')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders translation keys for labels', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue({
      bz: -3.4,
      speed: 420,
      density: 5.2,
      kp: 3,
      timestamp: '2024-01-01T00:00:00Z',
    });

    renderSpaceWeather();

    expect(await screen.findByText('space_weather.bz')).toBeInTheDocument();
    expect(screen.getByText('space_weather.speed')).toBeInTheDocument();
    expect(screen.getByText('space_weather.density')).toBeInTheDocument();
    expect(screen.getByText('space_weather.kp')).toBeInTheDocument();
  });

  it('shows an error state and retry when NOAA has no current data', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue(null);

    renderSpaceWeather();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'data_state.retry' })).toBeInTheDocument();
  });

  it('shows a retry action when the source request fails', async () => {
    vi.mocked(fetchSolarData).mockRejectedValue(new Error('offline'));
    renderSpaceWeather();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'data_state.retry' })).toBeInTheDocument();
  });

  it('renders Kp index bar visual', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue({
      bz: 0,
      speed: 300,
      density: 3,
      kp: 6,
      timestamp: '2024-01-01T00:00:00Z',
    });

    const { container } = render(
      <SolarActivityProvider>
        <SpaceWeather />
      </SolarActivityProvider>,
    );

    await screen.findByText('6');
    // Kp bar should have 10 segments
    const barSegments = container.querySelectorAll('.flex-1.rounded-sm');
    expect(barSegments).toHaveLength(10);
  });
});

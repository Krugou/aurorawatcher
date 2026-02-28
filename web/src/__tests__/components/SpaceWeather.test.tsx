import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock fetchSolarData
vi.mock('../../services/solarService', () => ({
  fetchSolarData: vi.fn(),
}));

import { SpaceWeather } from '../../components/SpaceWeather';
import { fetchSolarData } from '../../services/solarService';

describe('SpaceWeather', () => {
  it('shows skeletons while loading', () => {
    vi.mocked(fetchSolarData).mockReturnValue(new Promise(vi.fn())); // never resolves
    render(React.createElement(SpaceWeather));
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

    render(React.createElement(SpaceWeather));

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

    render(React.createElement(SpaceWeather));

    expect(await screen.findByText('space_weather.bz')).toBeInTheDocument();
    expect(screen.getByText('space_weather.speed')).toBeInTheDocument();
    expect(screen.getByText('space_weather.density')).toBeInTheDocument();
    expect(screen.getByText('space_weather.kp')).toBeInTheDocument();
  });

  it('renders nothing when data is null', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue(null);

    const { container } = render(React.createElement(SpaceWeather));

    // Wait for loading to complete
    await vi.waitFor(() => {
      const skeletons = container.querySelectorAll('[role="status"]');
      expect(skeletons).toHaveLength(0);
    });
  });

  it('renders Kp index bar visual', async () => {
    vi.mocked(fetchSolarData).mockResolvedValue({
      bz: 0,
      speed: 300,
      density: 3,
      kp: 6,
      timestamp: '2024-01-01T00:00:00Z',
    });

    const { container } = render(React.createElement(SpaceWeather));

    await screen.findByText('6');
    // Kp bar should have 10 segments
    const barSegments = container.querySelectorAll('.flex-1.rounded-sm');
    expect(barSegments).toHaveLength(10);
  });
});

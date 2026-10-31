import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock useImageMetadata
vi.mock('../../hooks/useImageMetadata', () => ({
  useImageMetadata: vi.fn(() => '14:30'),
}));

const mocks = vi.hoisted(() => ({
  kp: 5,
  bz: -8,
  speed: 600,
  statuses: [] as { name: string; color: string; status: string }[],
}));

vi.mock('../../hooks/useSolarActivity', () => ({
  useSolarActivity: () => ({
    data: { kp: mocks.kp, bz: mocks.bz, speed: mocks.speed },
    loading: false,
    error: null,
  }),
}));
vi.mock('../../hooks/useStationStatuses', () => ({
  useStationStatuses: () => ({ statuses: mocks.statuses, loading: false }),
}));

import { fireEvent } from '@testing-library/react';

import { MinimalView } from '../../components/MinimalView';

const mockLocations = {
  loc1: {
    id: 'loc1',
    name: 'stations.kevo',
    fullname: 'Kevo Observatory',
    mapUrl: 'https://example.com/map.png',
    image: 'https://example.com/kevo.jpg',
    lat: 69.76,
    lon: 27.01,
  },
  loc2: {
    id: 'loc2',
    name: 'stations.sodankyla',
    fullname: 'Sodankylä Observatory',
    mapUrl: 'https://example.com/map2.png',
    image: 'https://example.com/sod.jpg',
    lat: 67.37,
    lon: 26.63,
  },
};

describe('MinimalView', () => {
  it('renders a card for each location', () => {
    render(React.createElement(MinimalView, { locations: mockLocations, timestamp: 12345 }));
    expect(screen.getByText('stations.kevo')).toBeInTheDocument();
    expect(screen.getByText('stations.sodankyla')).toBeInTheDocument();
  });

  it('renders images with lazy loading', () => {
    const { container } = render(
      React.createElement(MinimalView, { locations: mockLocations, timestamp: 12345 }),
    );
    const images = container.querySelectorAll('img[loading="lazy"]');
    expect(images).toHaveLength(2);
  });

  it('renders back button', () => {
    render(React.createElement(MinimalView, { locations: mockLocations, timestamp: 12345 }));
    expect(screen.getByText('minimal.back')).toBeInTheDocument();
  });

  it('displays last-modified timestamps', () => {
    render(React.createElement(MinimalView, { locations: mockLocations, timestamp: 12345 }));
    const timestamps = screen.getAllByText('14:30');
    expect(timestamps).toHaveLength(2);
  });

  it('hides cameras when quiet until requested', () => {
    mocks.kp = 0;
    mocks.bz = 3;
    mocks.speed = 300;
    mocks.statuses = [{ name: 'Kevo', color: '#D7D7D7', status: 'QUIET' }];
    const { container } = render(
      React.createElement(MinimalView, { locations: mockLocations, timestamp: 1 }),
    );
    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(screen.getByText('minimal.quiet')).toBeInTheDocument();
    fireEvent.click(screen.getByText('minimal.show_cams'));
    expect(container.querySelectorAll('img')).toHaveLength(2);
  });

  it('lists active stations', () => {
    mocks.statuses = [{ name: 'Kevo', color: '#EE6677', status: 'HIGH' }];
    render(React.createElement(MinimalView, { locations: mockLocations, timestamp: 1 }));
    expect(screen.getByText(/common\.loc\.kevo/)).toBeInTheDocument();
  });
});

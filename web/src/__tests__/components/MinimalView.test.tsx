import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock useImageMetadata
vi.mock('../../hooks/useImageMetadata', () => ({
  useImageMetadata: vi.fn(() => '14:30'),
}));

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
});

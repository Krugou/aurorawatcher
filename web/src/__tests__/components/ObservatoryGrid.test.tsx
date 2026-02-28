import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock ObservatoryCard to avoid importing its complex dependencies
vi.mock('../../components/ObservatoryCard', () => ({
  ObservatoryCard: ({ id }: { id: string }) =>
    React.createElement('div', { 'data-testid': `card-${id}` }, id),
}));

import { ObservatoryGrid } from '../../components/ObservatoryGrid';

const mockLocations = {
  kevo: {
    id: 'kevo',
    name: 'Kevo',
    fullname: 'Kevo Observatory',
    mapUrl: 'https://example.com/map.png',
    image: 'https://example.com/kevo.jpg',
  },
  sod: {
    id: 'sod',
    name: 'Sodankylä',
    fullname: 'Sodankylä Observatory',
    mapUrl: 'https://example.com/map2.png',
    image: 'https://example.com/sod.jpg',
  },
  nur: {
    id: 'nur',
    name: 'Nurmijärvi',
    fullname: 'Nurmijärvi Observatory',
    mapUrl: 'https://example.com/map3.png',
    image: 'https://example.com/nur.jpg',
  },
};

describe('ObservatoryGrid', () => {
  it('renders correct number of ObservatoryCard children', () => {
    const { container } = render(
      React.createElement(ObservatoryGrid, { locations: mockLocations, timestamp: 12345 }),
    );
    const cards = container.querySelectorAll('[data-testid^="card-"]');
    expect(cards).toHaveLength(3);
  });

  it('passes location IDs to cards', () => {
    const { getByTestId } = render(
      React.createElement(ObservatoryGrid, { locations: mockLocations, timestamp: 12345 }),
    );
    expect(getByTestId('card-kevo')).toBeInTheDocument();
    expect(getByTestId('card-sod')).toBeInTheDocument();
    expect(getByTestId('card-nur')).toBeInTheDocument();
  });

  it('renders with grid layout', () => {
    const { container } = render(
      React.createElement(ObservatoryGrid, { locations: mockLocations, timestamp: 12345 }),
    );
    const grid = container.firstElementChild;
    expect(grid?.className).toContain('grid');
  });

  it('renders empty grid for no locations', () => {
    const { container } = render(
      React.createElement(ObservatoryGrid, { locations: {}, timestamp: 12345 }),
    );
    const cards = container.querySelectorAll('[data-testid^="card-"]');
    expect(cards).toHaveLength(0);
  });
});

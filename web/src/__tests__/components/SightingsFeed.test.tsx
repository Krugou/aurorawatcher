import { render, screen } from '@testing-library/react';
import { onSnapshot } from 'firebase/firestore';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SightingsFeed } from '../../components/SightingsFeed';

describe('SightingsFeed', () => {
  it('shows loading text initially', () => {
    // onSnapshot never calls the callback, so loading stays true
    vi.mocked(onSnapshot).mockImplementation(() => vi.fn());

    render(React.createElement(SightingsFeed));
    expect(screen.getByText('social.scanning')).toBeInTheDocument();
  });

  it('renders nothing when there are no sightings', () => {
    vi.mocked(onSnapshot).mockImplementation((_, callback) => {
      // Call with empty snapshot
      (callback as (snapshot: { docs: never[] }) => void)({ docs: [] });
      return vi.fn();
    });

    const { container } = render(React.createElement(SightingsFeed));
    // Should render nothing (return null) when sightings are empty and not loading
    expect(container.querySelector('.animate-marquee')).not.toBeInTheDocument();
  });

  it('renders sighting entries when data is available', () => {
    vi.mocked(onSnapshot).mockImplementation((_, callback) => {
      const mockDocs = [
        {
          id: 'sighting1',
          data: () => ({
            timestamp: { toDate: () => new Date('2024-01-01T12:00:00Z') },
            location: { lat: 60.17, lng: 24.94 },
          }),
        },
      ];
      (callback as (snapshot: { docs: typeof mockDocs }) => void)({ docs: mockDocs });
      return vi.fn();
    });

    render(React.createElement(SightingsFeed));
    // Should show the sighting (social.reported)
    expect(screen.getByText(/social\.reported/)).toBeInTheDocument();
  });
});

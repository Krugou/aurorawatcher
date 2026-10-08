import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Header } from '../../components/Header';
import { SolarActivityContext } from '../../context/SolarActivityContext';
import { SolarActivityState } from '../../context/SolarActivityContext';

const renderHeader = (
  state: SolarActivityState = {
    data: null,
    loading: true,
    error: false,
    lastUpdated: null,
    refresh: async () => {},
  },
) =>
  render(
    React.createElement(
      SolarActivityContext.Provider,
      { value: state },
      React.createElement(Header),
    ),
  );

describe('Header', () => {
  it('renders the app title translation key', () => {
    renderHeader();
    expect(screen.getByText('app.title')).toBeInTheDocument();
  });

  it('renders the subtitle translation key', () => {
    renderHeader();
    expect(screen.getByText('header.subtitle')).toBeInTheDocument();
  });

  it('renders a header element', () => {
    const { container } = renderHeader();
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('renders a live NOAA status board with an accessible status message', () => {
    renderHeader({
      data: { kp: 6, bz: -7, speed: 620, density: 4, timestamp: '2026-10-08T12:00:00Z' },
      loading: false,
      error: false,
      lastUpdated: Date.now(),
      refresh: async () => {},
    });
    const marquee = document.querySelector('.animate-marquee');
    expect(marquee).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('status.kp: 6.0');
    expect(screen.getByRole('status')).toHaveTextContent('status.speed: 620 km/s');
  });

  it('has proper heading hierarchy with h1', () => {
    renderHeader();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
  });
});

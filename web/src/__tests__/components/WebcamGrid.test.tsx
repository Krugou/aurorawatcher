import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { WebcamGrid } from '../../components/WebcamGrid';

describe('WebcamGrid', () => {
  it('renders all webcam entries', () => {
    // Mock fetch for HEAD requests made by the component
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    render(React.createElement(WebcamGrid));

    expect(screen.getByText('Sodankylä (FI)')).toBeInTheDocument();
    expect(screen.getByText('Skibotn (NO)')).toBeInTheDocument();
    expect(screen.getByText('Poker Flat (US)')).toBeInTheDocument();
    expect(screen.getByText('Kiruna (SE)')).toBeInTheDocument();
  });

  it('renders correct number of webcam images', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const { container } = render(React.createElement(WebcamGrid));
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(4);
  });

  it('images have lazy loading attribute', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const { container } = render(React.createElement(WebcamGrid));
    const images = container.querySelectorAll('img[loading="lazy"]');
    expect(images).toHaveLength(4);
  });

  it('renders grid layout', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const { container } = render(React.createElement(WebcamGrid));
    const grid = container.firstElementChild;
    expect(grid?.className).toContain('grid');
  });
});

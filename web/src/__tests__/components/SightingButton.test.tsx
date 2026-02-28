import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock useGeolocation hook
vi.mock('../../hooks/useGeolocation', () => ({
  useGeolocation: vi.fn(() => ({
    coords: null,
    error: null,
    loading: false,
    requestLocation: vi.fn(),
  })),
}));

import { SightingButton } from '../../components/SightingButton';

describe('SightingButton', () => {
  it('renders the sighting button', () => {
    render(React.createElement(SightingButton));
    expect(screen.getByText('I SEE IT! 👀')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(React.createElement(SightingButton));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('button is not disabled in idle state', () => {
    render(React.createElement(SightingButton));
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('has gradient styling for the active button', () => {
    const { container } = render(React.createElement(SightingButton));
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-gradient-to-r');
  });
});

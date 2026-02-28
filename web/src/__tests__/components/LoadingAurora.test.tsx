import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { LoadingAurora } from '../../components/LoadingAurora';

describe('LoadingAurora', () => {
  it('renders the loading text', () => {
    render(React.createElement(LoadingAurora));
    expect(screen.getByText('SEARCHING SKIES...')).toBeInTheDocument();
  });

  it('renders the spinner element', () => {
    const { container } = render(React.createElement(LoadingAurora));
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has aurora gradient background', () => {
    const { container } = render(React.createElement(LoadingAurora));
    // Check for the conic gradient divs
    const rotatingElements = container.querySelectorAll('[class*="animate-"]');
    expect(rotatingElements.length).toBeGreaterThanOrEqual(2);
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from '../../components/Skeleton';

describe('Skeleton', () => {
  it('renders with role="status"', () => {
    render(React.createElement(Skeleton));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(React.createElement(Skeleton));
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-label', 'grid.loading');
  });

  it('applies custom className', () => {
    render(React.createElement(Skeleton, { className: 'h-28 w-full' }));
    const el = screen.getByRole('status');
    expect(el.className).toContain('h-28');
    expect(el.className).toContain('w-full');
  });

  it('has pulse animation class', () => {
    render(React.createElement(Skeleton));
    const el = screen.getByRole('status');
    expect(el.className).toContain('animate-pulse');
  });
});

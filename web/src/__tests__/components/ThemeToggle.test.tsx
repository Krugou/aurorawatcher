import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// Mock useTheme hook
vi.mock('../../hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
  })),
}));

import { ThemeToggle } from '../../components/ThemeToggle';
import { useTheme } from '../../hooks/useTheme';

describe('ThemeToggle', () => {
  it('renders a button element', () => {
    render(React.createElement(ThemeToggle));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows correct aria-label for dark theme', () => {
    render(React.createElement(ThemeToggle));
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'theme.switchToLight');
  });

  it('shows correct aria-label for light theme', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      toggleTheme: vi.fn(),
    });

    render(React.createElement(ThemeToggle));
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'theme.switchToDark');
  });

  it('calls toggleTheme when clicked', () => {
    const mockToggle = vi.fn();
    vi.mocked(useTheme).mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggle,
    });

    render(React.createElement(ThemeToggle));
    screen.getByRole('button').click();

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('renders SVG icon', () => {
    const { container } = render(React.createElement(ThemeToggle));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

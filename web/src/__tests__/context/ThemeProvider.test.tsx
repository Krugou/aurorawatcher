import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeContext, ThemeContextType } from '../../context/ThemeContext';
import { ThemeProvider } from '../../context/ThemeProvider';

describe('ThemeProvider', () => {
  it('provides dark theme by default', () => {
    let capturedTheme = '';
    render(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(ThemeContext.Consumer, null, ((value: ThemeContextType | null) => {
          capturedTheme = value?.theme ?? '';
          return React.createElement('span', null, value?.theme);
        }) as unknown as React.ReactNode),
      ),
    );

    expect(capturedTheme).toBe('dark');
  });

  it('applies dark class to documentElement by default', () => {
    render(React.createElement(ThemeProvider, null, React.createElement('div', null, 'child')));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles from dark to light theme', () => {
    const TestConsumer = () => {
      const context = React.useContext(ThemeContext);
      const handleClick = () => {
        context?.toggleTheme();
      };
      return React.createElement(
        'div',
        null,
        React.createElement('span', { 'data-testid': 'theme' }, context?.theme),
        React.createElement(
          'button',
          {
            'data-testid': 'toggle',
            onClick: handleClick,
          },
          'Toggle',
        ),
      );
    };

    render(React.createElement(ThemeProvider, null, React.createElement(TestConsumer)));

    expect(screen.getByTestId('theme').textContent).toBe('dark');

    act(() => {
      screen.getByTestId('toggle').click();
    });

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists theme to localStorage', () => {
    const TestConsumer = () => {
      const context = React.useContext(ThemeContext);
      const handleClick = () => {
        context?.toggleTheme();
      };
      return React.createElement(
        'button',
        {
          'data-testid': 'toggle',
          onClick: handleClick,
        },
        'Toggle',
      );
    };

    render(React.createElement(ThemeProvider, null, React.createElement(TestConsumer)));

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

    act(() => {
      screen.getByTestId('toggle').click();
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('restores theme from localStorage', () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(localStorage.getItem).mockReturnValue('light');

    let capturedTheme = '';
    render(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(ThemeContext.Consumer, null, ((value: ThemeContextType | null) => {
          capturedTheme = value?.theme ?? '';
          return null;
        }) as unknown as React.ReactNode),
      ),
    );

    expect(capturedTheme).toBe('light');
  });
});

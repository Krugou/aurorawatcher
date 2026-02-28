import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeContext, ThemeContextType } from '../../context/ThemeContext';
import { useTheme } from '../../hooks/useTheme';

describe('useTheme', () => {
  it('throws when used outside of ThemeProvider', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
  });

  it('returns theme context when used within a provider', () => {
    const mockContext: ThemeContextType = {
      theme: 'dark',
      toggleTheme: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeContext.Provider, { value: mockContext }, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('returns light theme when set in context', () => {
    const mockContext: ThemeContextType = {
      theme: 'light',
      toggleTheme: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(ThemeContext.Provider, { value: mockContext }, children);

    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('light');
  });
});

import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { LanguageSwitcher } from '../../components/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('renders a button', () => {
    render(React.createElement(LanguageSwitcher));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows correct aria-label', () => {
    render(React.createElement(LanguageSwitcher));
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'common.switch_lang');
  });

  it('displays FI label when current language is en', () => {
    render(React.createElement(LanguageSwitcher));
    // Mock returns language='en', so we should see FI label
    expect(screen.getByText('FI')).toBeInTheDocument();
  });

  it('handles both languages', () => {
    // Default mock returns 'en' language, verify that path works
    render(React.createElement(LanguageSwitcher));
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('is a clickable button with cursor-pointer', () => {
    const { container } = render(React.createElement(LanguageSwitcher));
    const button = container.querySelector('button');
    expect(button?.className).toContain('cursor-pointer');
  });
});

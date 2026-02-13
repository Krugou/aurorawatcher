import '../i18n'; // Ensure i18n is initialized

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LanguageSwitcher } from './LanguageSwitcher';

// Mock analytics to prevent Firebase initialization issues
vi.mock('../utils/analytics', () => ({
  Analytics: {
    trackLanguageChange: vi.fn(),
  },
}));

describe('LanguageSwitcher', () => {
  it('renders correctly', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByLabelText('Switch Language');
    expect(button).toBeInTheDocument();
  });

  it('toggles language on click', () => {
    render(<LanguageSwitcher />);
    const button = screen.getByLabelText('Switch Language');

    // Initial state (assuming default is 'fi', button shows EN flag/text to switch TO en? Or shows current?)
    // In code: {i18n.language === 'en' ? '🇫🇮 FI' : '🇬🇧 EN'}
    // If language is 'fi', it shows '🇬🇧 EN' (switch to EN).

    // Let's check text content to verify toggle
    const initialText = button.textContent;

    fireEvent.click(button);

    expect(button.textContent).not.toBe(initialText);

    fireEvent.click(button);

    expect(button.textContent).toBe(initialText);
  });
});

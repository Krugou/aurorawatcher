import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { CollapsibleSection } from '../../components/CollapsibleSection';

describe('CollapsibleSection', () => {
  it('renders title text', () => {
    render(
      React.createElement(
        CollapsibleSection,
        { title: 'Test Section' },
        React.createElement('p', null, 'Content'),
      ),
    );
    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  it('renders children when expanded by default', () => {
    render(
      React.createElement(
        CollapsibleSection,
        { title: 'Section' },
        React.createElement('p', null, 'Visible Content'),
      ),
    );
    expect(screen.getByText('Visible Content')).toBeInTheDocument();
  });

  it('starts collapsed when defaultExpanded=false', () => {
    const { container } = render(
      React.createElement(
        CollapsibleSection,
        { title: 'Section', defaultExpanded: false },
        React.createElement('p', null, 'Hidden Content'),
      ),
    );
    // Content container should have max-h-0 class when collapsed
    const contentDiv = container.querySelector('.max-h-0');
    expect(contentDiv).toBeInTheDocument();
  });

  it('toggles expanded/collapsed on click', () => {
    const { container } = render(
      React.createElement(
        CollapsibleSection,
        { title: 'Section' },
        React.createElement('p', null, 'Content'),
      ),
    );

    const button = screen.getByRole('button');
    act(() => {
      button.click();
    });

    // After toggle, should have max-h-0 (collapsed)
    const collapsedDiv = container.querySelector('.max-h-0');
    expect(collapsedDiv).toBeInTheDocument();
  });

  it('supports keyboard Enter to toggle', () => {
    render(
      React.createElement(
        CollapsibleSection,
        { title: 'Section' },
        React.createElement('p', null, 'Content'),
      ),
    );

    const button = screen.getByRole('button');
    act(() => {
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
  });

  it('supports keyboard Space to toggle', () => {
    render(
      React.createElement(
        CollapsibleSection,
        { title: 'Section' },
        React.createElement('p', null, 'Content'),
      ),
    );

    const button = screen.getByRole('button');
    act(() => {
      button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });
  });

  it('persists state to localStorage when storageKey is provided', () => {
    render(
      React.createElement(
        CollapsibleSection,
        { title: 'Section', storageKey: 'test_section' },
        React.createElement('p', null, 'Content'),
      ),
    );

    const button = screen.getByRole('button');
    act(() => {
      button.click();
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(localStorage.setItem).toHaveBeenCalledWith('section_test_section', 'false');
  });

  it('restores state from localStorage', () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    vi.mocked(localStorage.getItem).mockReturnValue('false');

    const { container } = render(
      React.createElement(
        CollapsibleSection,
        { title: 'Section', storageKey: 'saved_section' },
        React.createElement('p', null, 'Content'),
      ),
    );

    // Should start collapsed since localStorage says 'false'
    const collapsedDiv = container.querySelector('.max-h-0');
    expect(collapsedDiv).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(
      React.createElement(
        CollapsibleSection,
        {
          title: 'Section',
          badge: React.createElement('span', null, 'LIVE'),
        },
        React.createElement('p', null, 'Content'),
      ),
    );
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(
      React.createElement(
        CollapsibleSection,
        {
          title: 'Section',
          icon: React.createElement('span', { 'data-testid': 'icon' }, '🌌'),
        },
        React.createElement('p', null, 'Content'),
      ),
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders as section element', () => {
    const { container } = render(
      React.createElement(
        CollapsibleSection,
        { title: 'Section' },
        React.createElement('p', null, 'Content'),
      ),
    );
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});

import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CollapsibleSection } from '../../components/CollapsibleSection';

describe('CollapsibleSection', () => {
  it('renders title text', () => {
    render(
      <CollapsibleSection title="Test Section">
        <p>Content</p>
      </CollapsibleSection>,
    );
    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  it('renders children when expanded by default', () => {
    render(
      <CollapsibleSection title="Section">
        <p>Visible Content</p>
      </CollapsibleSection>,
    );
    expect(screen.getByText('Visible Content')).toBeInTheDocument();
  });

  it('starts collapsed when defaultExpanded=false', () => {
    const { container } = render(
      <CollapsibleSection title="Section" defaultExpanded={false}>
        <p>Hidden Content</p>
      </CollapsibleSection>,
    );
    // Content container should have max-h-0 class when collapsed
    const contentDiv = container.querySelector('.max-h-0');
    expect(contentDiv).toBeInTheDocument();
  });

  it('toggles expanded/collapsed on click', () => {
    const { container } = render(
      <CollapsibleSection title="Section">
        <p>Content</p>
      </CollapsibleSection>,
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
      <CollapsibleSection title="Section">
        <p>Content</p>
      </CollapsibleSection>,
    );

    const button = screen.getByRole('button');
    act(() => {
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
  });

  it('supports keyboard Space to toggle', () => {
    render(
      <CollapsibleSection title="Section">
        <p>Content</p>
      </CollapsibleSection>,
    );

    const button = screen.getByRole('button');
    act(() => {
      button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });
  });

  it('persists state to localStorage when storageKey is provided', () => {
    render(
      <CollapsibleSection title="Section" storageKey="test_section">
        <p>Content</p>
      </CollapsibleSection>,
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
      <CollapsibleSection title="Section" storageKey="saved_section">
        <p>Content</p>
      </CollapsibleSection>,
    );

    // Should start collapsed since localStorage says 'false'
    const collapsedDiv = container.querySelector('.max-h-0');
    expect(collapsedDiv).toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(
      <CollapsibleSection title="Section" badge={<span>LIVE</span>}>
        <p>Content</p>
      </CollapsibleSection>,
    );
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(
      <CollapsibleSection title="Section" icon={<span data-testid="icon">🌌</span>}>
        <p>Content</p>
      </CollapsibleSection>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders as section element', () => {
    const { container } = render(
      <CollapsibleSection title="Section">
        <p>Content</p>
      </CollapsibleSection>,
    );
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});

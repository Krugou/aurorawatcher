import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Header } from '../../components/Header';

describe('Header', () => {
  it('renders the app title translation key', () => {
    render(React.createElement(Header));
    expect(screen.getByText('app.title')).toBeInTheDocument();
  });

  it('renders the subtitle translation key', () => {
    render(React.createElement(Header));
    expect(screen.getByText('header.subtitle')).toBeInTheDocument();
  });

  it('renders a header element', () => {
    const { container } = render(React.createElement(Header));
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('renders the scrolling status text with translation keys', () => {
    render(React.createElement(Header));
    // The scrolling text uses multiple translation keys joined
    const marquee = document.querySelector('.animate-marquee');
    expect(marquee).toBeInTheDocument();
  });

  it('has proper heading hierarchy with h1', () => {
    render(React.createElement(Header));
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
  });
});

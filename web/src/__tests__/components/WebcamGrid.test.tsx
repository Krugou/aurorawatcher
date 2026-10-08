import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { WebcamGrid } from '../../components/WebcamGrid';

const mockPokerFeed = () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('data: "0": "PKR/tagged_cam/current.jpg"'));
      controller.close();
    },
  });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body }));
};

describe('WebcamGrid', () => {
  it('renders all webcam entries', () => {
    mockPokerFeed();
    render(React.createElement(WebcamGrid));

    expect(screen.getByText('Sodankylä (FI)')).toBeInTheDocument();
    expect(screen.getByText('Skibotn (NO)')).toBeInTheDocument();
    expect(screen.getByText('Poker Flat (US)')).toBeInTheDocument();
    expect(screen.getByText('Kiruna (SE)')).toBeInTheDocument();
  });

  it('renders all four camera images after resolving the dynamic Poker Flat image', async () => {
    mockPokerFeed();
    render(React.createElement(WebcamGrid));
    await waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(4));
  });

  it('images have lazy loading attribute', async () => {
    mockPokerFeed();
    const { container } = render(React.createElement(WebcamGrid));
    await screen.findByRole('img', { name: 'Poker Flat (US)' });
    expect(container.querySelectorAll('img[loading="lazy"]')).toHaveLength(4);
  });

  it('renders grid layout', () => {
    mockPokerFeed();
    const { container } = render(React.createElement(WebcamGrid));
    expect(container.firstElementChild?.className).toContain('grid');
  });

  it('shows a named unavailable state and retry button when a feed fails', async () => {
    mockPokerFeed();
    const { container } = render(React.createElement(WebcamGrid));
    const pokerFlatImage = await screen.findByRole('img', { name: 'Poker Flat (US)' });
    fireEvent.error(pokerFlatImage);
    expect(screen.getByText('webcams.unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'webcams.retry' })).toBeInTheDocument();
    const pokerCard = [...container.querySelectorAll('article')].find((card) =>
      card.textContent?.includes('Poker Flat (US)'),
    );
    expect(pokerCard).toBeInTheDocument();
  });

  it('loads other images directly from their configured camera sources', () => {
    mockPokerFeed();
    const { container } = render(React.createElement(WebcamGrid));
    const images = container.querySelectorAll('img');
    expect(images[0].getAttribute('src')).toContain('https://www.sgo.fi/');
    expect(images[0].getAttribute('src')).not.toContain('workers.dev');
  });
});

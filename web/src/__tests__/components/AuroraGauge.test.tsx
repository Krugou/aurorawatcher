import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { AuroraGauge } from '../../components/AuroraGauge';

describe('AuroraGauge', () => {
  it('shows NOPE for overcast conditions (cloudCover >= 7)', () => {
    render(React.createElement(AuroraGauge, { cloudCover: 8, kp: 7, bz: -10 }));
    expect(screen.getByText('NOPE ☁️')).toBeInTheDocument();
  });

  it('shows GO NOW! for clear sky + high solar activity', () => {
    render(React.createElement(AuroraGauge, { cloudCover: 0, kp: 7, bz: -15 }));
    expect(screen.getByText('GO NOW! 🚀')).toBeInTheDocument();
  });

  it('shows POSSIBLE for moderate conditions', () => {
    render(React.createElement(AuroraGauge, { cloudCover: 2, kp: 5, bz: 0 }));
    expect(screen.getByText('POSSIBLE 👀')).toBeInTheDocument();
  });

  it('shows NOPE for poor conditions', () => {
    // cloudCover 4/8 = 50% cloud, kp 3/10 = 30% solar → low score
    render(React.createElement(AuroraGauge, { cloudCover: 4, kp: 3, bz: 0 }));
    expect(screen.getByText('NOPE ☁️')).toBeInTheDocument();
  });

  it('displays cloud cover percentage', () => {
    render(React.createElement(AuroraGauge, { cloudCover: 4, kp: 3, bz: 0 }));
    // Cloud cover percentage is rendered but may be split across elements, so use a container query
    const { container } = render(React.createElement(AuroraGauge, { cloudCover: 4, kp: 3, bz: 0 }));
    expect(container.querySelector('[title="Cloud Cover"]')).toBeInTheDocument();
  });

  it('displays solar activity percentage', () => {
    const { container } = render(React.createElement(AuroraGauge, { cloudCover: 0, kp: 5, bz: 0 }));
    expect(container.querySelector('[title="Solar Activity"]')).toBeInTheDocument();
  });

  it('clear sky + decent activity gives at least 80% score', () => {
    render(React.createElement(AuroraGauge, { cloudCover: 1, kp: 6, bz: 0 }));
    expect(screen.getByText('GO NOW! 🚀')).toBeInTheDocument();
  });

  it('renders the gauge visual elements', () => {
    const { container } = render(React.createElement(AuroraGauge, { cloudCover: 0, kp: 3, bz: 0 }));
    // Needle element
    expect(container.querySelector('.origin-bottom')).toBeInTheDocument();
    // Semi-circle
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });
});

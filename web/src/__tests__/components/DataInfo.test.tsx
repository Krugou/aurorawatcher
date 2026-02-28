import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { DataInfo } from '../../components/DataInfo';

describe('DataInfo', () => {
  it('renders FMI section title', () => {
    render(React.createElement(DataInfo));
    expect(screen.getByText('data_info.fmi_title')).toBeInTheDocument();
  });

  it('renders NOAA section title', () => {
    render(React.createElement(DataInfo));
    expect(screen.getByText('data_info.noaa_title')).toBeInTheDocument();
  });

  it('renders FMI description', () => {
    render(React.createElement(DataInfo));
    expect(screen.getByText('data_info.fmi_desc')).toBeInTheDocument();
  });

  it('renders disclaimer', () => {
    render(React.createElement(DataInfo));
    expect(screen.getByText('data_info.disclaimer')).toBeInTheDocument();
  });

  it('renders external links with target="_blank"', () => {
    const { container } = render(React.createElement(DataInfo));
    const links = container.querySelectorAll('a[target="_blank"]');
    expect(links.length).toBeGreaterThanOrEqual(4);
  });

  it('renders FMI open data link', () => {
    const { container } = render(React.createElement(DataInfo));
    const fmiLink = container.querySelector('a[href="https://en.ilmatieteenlaitos.fi/open-data"]');
    expect(fmiLink).toBeInTheDocument();
  });

  it('renders NOAA SWPC link', () => {
    const { container } = render(React.createElement(DataInfo));
    const noaaLink = container.querySelector('a[href="https://www.swpc.noaa.gov/"]');
    expect(noaaLink).toBeInTheDocument();
  });
});

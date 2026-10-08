import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MobileNav } from '../../components/MobileNav';

describe('MobileNav', () => {
  it('maps Cams, Stats, and Map buttons to their dashboard sections', () => {
    const onNavigate = vi.fn();
    render(<MobileNav onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: /mobileNav.cameras/i }));
    fireEvent.click(screen.getByRole('button', { name: /mobileNav.stats/i }));
    fireEvent.click(screen.getByRole('button', { name: /mobileNav.map/i }));
    expect(onNavigate.mock.calls).toEqual([['observatory_status'], ['graphs'], ['map']]);
  });
});

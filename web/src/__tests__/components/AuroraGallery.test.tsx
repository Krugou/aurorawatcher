import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuroraGallery } from '../../components/AuroraGallery';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      key === 'common.loc.hankasalmi_full'
        ? 'Hankasalmi Observatory, Finland'
        : (options?.defaultValue ?? key),
    i18n: { language: 'en' },
  }),
}));

describe('AuroraGallery', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows the full translated place name on each saved image', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          entries: [
            {
              timestamp: 1791137700000,
              camId: 'hankasalmi',
              filename: 'history/hankasalmi_20261004_1815.webp',
              score: 4,
              greenPixels: 244,
              purplePixels: 0,
              redPixels: 0,
            },
          ],
        }),
      }),
    );

    render(<AuroraGallery />);
    expect(await screen.findByText('Hankasalmi Observatory, Finland')).toBeInTheDocument();
  });
});

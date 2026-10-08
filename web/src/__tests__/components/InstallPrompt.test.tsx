import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InstallPrompt } from '../../components/InstallPrompt';

describe('InstallPrompt', () => {
  it('shows localized browser install guidance when no install event is available', () => {
    render(<InstallPrompt />);
    fireEvent.click(screen.getByText('pwa.install'));
    expect(screen.getByText('pwa.manualInstall')).toBeInTheDocument();
  });

  it('uses the browser install event and hides after the app is installed', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' }),
    });
    render(<InstallPrompt />);
    window.dispatchEvent(event);
    fireEvent.click(await screen.findByRole('button', { name: 'pwa.install' }));
    await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
    window.dispatchEvent(new Event('appinstalled'));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'pwa.install' })).not.toBeInTheDocument(),
    );
  });
});

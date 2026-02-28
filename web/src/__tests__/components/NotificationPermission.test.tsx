import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { NotificationPermission } from '../../components/NotificationPermission';

describe('NotificationPermission', () => {
  it('returns null when notifications are unsupported', () => {
    // Remove Notification from window
    const originalNotification = window.Notification;
    // @ts-expect-error - deleting Notification for test
    delete window.Notification;

    const { container } = render(
      React.createElement(NotificationPermission, { savedStation: null }),
    );

    // Wait for useEffect
    expect(container.innerHTML).toBe('');

    // Restore
    window.Notification = originalNotification;
  });

  it('shows enable button when permission is default', () => {
    // Mock Notification as 'default'
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'default', requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    });

    render(React.createElement(NotificationPermission, { savedStation: null }));
    expect(screen.getByText('notifications.enable')).toBeInTheDocument();
  });

  it('shows enabled status when permission is granted', () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'granted', requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    });

    render(React.createElement(NotificationPermission, { savedStation: null }));
    expect(screen.getByText('notifications.enabled')).toBeInTheDocument();
  });

  it('shows blocked message when permission is denied', () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'denied', requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    });

    render(React.createElement(NotificationPermission, { savedStation: null }));
    expect(screen.getByText('notifications.blocked')).toBeInTheDocument();
    expect(screen.getByText('notifications.blocked_hint')).toBeInTheDocument();
  });

  it('shows station-specific text when savedStation is provided', () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'default', requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    });

    render(React.createElement(NotificationPermission, { savedStation: 'Kevo' }));
    // The t() mock returns the key, but with interpolation it should contain the key
    expect(screen.getByText('notifications.for_station')).toBeInTheDocument();
  });

  it('shows test button when permission is granted', () => {
    Object.defineProperty(window, 'Notification', {
      value: { permission: 'granted', requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    });

    render(React.createElement(NotificationPermission, { savedStation: null }));
    // The i18n mock returns the key: t('common.test', 'TEST') → 'common.test'
    expect(screen.getByText('common.test')).toBeInTheDocument();
  });
});

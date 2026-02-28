import { describe, expect, it, vi } from 'vitest';

// Unmock analytics for this specific test file — we want to test the actual module
vi.unmock('../../utils/analytics');
// Keep firebase mocked
vi.mock('../../firebase', () => ({
  app: {},
  analytics: { app: { name: 'test' } }, // truthy analytics instance
}));
vi.mock('firebase/analytics', () => ({
  logEvent: vi.fn(),
  getAnalytics: vi.fn(),
}));

import { logEvent } from 'firebase/analytics';

import { Analytics } from '../../utils/analytics';

describe('Analytics', () => {
  describe('trackButtonClick', () => {
    it('calls logEvent with button_click event', () => {
      Analytics.trackButtonClick('theme_toggle');
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'button_click',
        expect.objectContaining({ button_name: 'theme_toggle' }),
      );
    });

    it('includes additional properties', () => {
      Analytics.trackButtonClick('sighting', { station: 'Kevo' });
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'button_click',
        expect.objectContaining({ button_name: 'sighting', station: 'Kevo' }),
      );
    });
  });

  describe('trackNavigation', () => {
    it('calls logEvent with page_view event', () => {
      Analytics.trackNavigation('/dashboard');
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'page_view',
        expect.objectContaining({ page_path: '/dashboard' }),
      );
    });
  });

  describe('trackSectionToggle', () => {
    it('sends open state', () => {
      Analytics.trackSectionToggle('webcams', true);
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'section_toggle',
        expect.objectContaining({ section_name: 'webcams', state: 'open' }),
      );
    });

    it('sends closed state', () => {
      Analytics.trackSectionToggle('webcams', false);
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'section_toggle',
        expect.objectContaining({ section_name: 'webcams', state: 'closed' }),
      );
    });
  });

  describe('trackThemeChange', () => {
    it('logs theme_change with correct theme', () => {
      Analytics.trackThemeChange('dark');
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'theme_change',
        expect.objectContaining({ theme: 'dark' }),
      );
    });
  });

  describe('trackLanguageChange', () => {
    it('logs language_change with correct language', () => {
      Analytics.trackLanguageChange('fi');
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'language_change',
        expect.objectContaining({ language: 'fi' }),
      );
    });
  });

  describe('trackStationInteraction', () => {
    it('logs station_interaction with station and action', () => {
      Analytics.trackStationInteraction('Kevo', 'save');
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'station_interaction',
        expect.objectContaining({ station_name: 'Kevo', action: 'save' }),
      );
    });
  });

  describe('trackLocationRequest', () => {
    it('logs location_request with status', () => {
      Analytics.trackLocationRequest('success');
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'location_request',
        expect.objectContaining({ status: 'success' }),
      );
    });
  });

  describe('trackNotificationPermission', () => {
    it('logs notification_permission with status', () => {
      Analytics.trackNotificationPermission('granted');
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'notification_permission',
        expect.objectContaining({ status: 'granted' }),
      );
    });
  });

  describe('trackExternalLink', () => {
    it('logs external_link_click with url and label', () => {
      Analytics.trackExternalLink('https://example.com', 'Example');
      expect(logEvent).toHaveBeenCalledWith(
        expect.anything(),
        'external_link_click',
        expect.objectContaining({ url: 'https://example.com', label: 'Example' }),
      );
    });
  });
});

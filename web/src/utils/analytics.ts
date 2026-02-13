import { logEvent } from 'firebase/analytics';

import { analytics } from '../firebase';

// Helper to safely log events only in production or if analytics is initialized
const safeLogEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (e) {
      console.warn('Analytics logging failed:', e);
    }
  } else {
    console.debug(`[Analytics Mock] ${eventName}`, eventParams);
  }
};

export const Analytics = {
  trackButtonClick: (buttonName: string, properties?: Record<string, unknown>) => {
    safeLogEvent('button_click', {
      button_name: buttonName,
      ...properties,
    });
  },

  trackNavigation: (pageName: string) => {
    safeLogEvent('page_view', {
      page_path: pageName,
    });
  },

  trackSectionToggle: (sectionName: string, isOpen: boolean) => {
    safeLogEvent('section_toggle', {
      section_name: sectionName,
      state: isOpen ? 'open' : 'closed',
    });
  },

  trackThemeChange: (theme: 'light' | 'dark') => {
    safeLogEvent('theme_change', {
      theme: theme,
    });
  },

  trackLanguageChange: (language: string) => {
    safeLogEvent('language_change', {
      language: language,
    });
  },

  trackStationInteraction: (
    stationName: string,
    action: 'save' | 'unsave' | 'view_history' | 'view_map' | 'view_fullscreen',
  ) => {
    safeLogEvent('station_interaction', {
      station_name: stationName,
      action: action,
    });
  },

  trackLocationRequest: (status: 'requested' | 'success' | 'denied' | 'error') => {
    safeLogEvent('location_request', {
      status: status,
    });
  },

  trackNotificationPermission: (status: 'requested' | 'granted' | 'denied') => {
    safeLogEvent('notification_permission', {
      status: status,
    });
  },

  trackExternalLink: (url: string, label: string) => {
    safeLogEvent('external_link_click', {
      url: url,
      label: label,
    });
  },
};

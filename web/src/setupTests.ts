import '@testing-library/jest-dom';

import { vi } from 'vitest';

// ─── Mock react-i18next ───────────────────────────────────────────────────────
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.defaultValue != null) return opts.defaultValue as string;
      return key;
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn().mockResolvedValue(undefined),
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// ─── Mock Firebase ────────────────────────────────────────────────────────────
vi.mock('./firebase', () => ({
  app: {},
  analytics: null,
}));

// ─── Mock Firebase/analytics ──────────────────────────────────────────────────
vi.mock('firebase/analytics', () => ({
  logEvent: vi.fn(),
  getAnalytics: vi.fn(),
}));

// ─── Mock Firebase/firestore ──────────────────────────────────────────────────
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-id' }),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()), // returns unsubscribe
  serverTimestamp: vi.fn(() => ({ seconds: 0, nanoseconds: 0 })),
  Timestamp: {
    fromDate: (d: Date) => ({ toDate: () => d, seconds: d.getTime() / 1000, nanoseconds: 0 }),
  },
}));

// ─── Mock Analytics utility ───────────────────────────────────────────────────
vi.mock('./utils/analytics', () => ({
  Analytics: {
    trackButtonClick: vi.fn(),
    trackNavigation: vi.fn(),
    trackSectionToggle: vi.fn(),
    trackThemeChange: vi.fn(),
    trackLanguageChange: vi.fn(),
    trackStationInteraction: vi.fn(),
    trackLocationRequest: vi.fn(),
    trackNotificationPermission: vi.fn(),
    trackExternalLink: vi.fn(),
  },
}));

// ─── Mock localStorage ───────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ─── Reset mocks between tests ───────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});

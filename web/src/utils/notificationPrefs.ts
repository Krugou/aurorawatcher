import type { StationStatus } from './auroraUtils';

export type NotifyLevel = 'HIGH' | 'MODERATE';
export type NotifyScope = 'station' | 'any';

export interface NotifyPrefs {
  level: NotifyLevel;
  scope: NotifyScope;
  station: string | null;
}

export const NOTIFY_PREFS_KEY = 'aurora_notify_prefs';
export const DEFAULT_NOTIFY_PREFS: NotifyPrefs = { level: 'HIGH', scope: 'station', station: null };

export const loadNotifyPrefs = (): NotifyPrefs => {
  try {
    const raw = localStorage.getItem(NOTIFY_PREFS_KEY);
    if (!raw) return { ...DEFAULT_NOTIFY_PREFS };
    const parsed = JSON.parse(raw) as Partial<NotifyPrefs>;
    return {
      level: parsed.level === 'MODERATE' ? 'MODERATE' : 'HIGH',
      scope: parsed.scope === 'any' ? 'any' : 'station',
      station: typeof parsed.station === 'string' ? parsed.station : null,
    };
  } catch {
    return { ...DEFAULT_NOTIFY_PREFS };
  }
};

export const saveNotifyPrefs = (prefs: NotifyPrefs): void => {
  localStorage.setItem(NOTIFY_PREFS_KEY, JSON.stringify(prefs));
};

const reaches = (status: StationStatus['status'], level: NotifyLevel): boolean =>
  status === 'HIGH' || (level === 'MODERATE' && status === 'MODERATE');

/** Returns the station names that should trigger a notification under the prefs. */
export const getTriggeredStations = (statuses: StationStatus[], prefs: NotifyPrefs): string[] => {
  const relevant =
    prefs.scope === 'station' && prefs.station
      ? statuses.filter((s) => s.name === prefs.station)
      : statuses;
  return relevant.filter((s) => reaches(s.status, prefs.level)).map((s) => s.name);
};

import { beforeEach, describe, expect, it } from 'vitest';

import type { StationStatus } from '../../utils/auroraUtils';
import {
  getTriggeredStations,
  loadNotifyPrefs,
  saveNotifyPrefs,
} from '../../utils/notificationPrefs';

const statuses: StationStatus[] = [
  { name: 'Kevo', color: '#EE6677', status: 'HIGH' },
  { name: 'Ivalo', color: '#CCBB44', status: 'MODERATE' },
  { name: 'Nurmijärvi', color: '#D7D7D7', status: 'QUIET' },
];

describe('notificationPrefs', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to high activity at my station', () => {
    expect(loadNotifyPrefs()).toEqual({ level: 'HIGH', scope: 'station', station: null });
  });

  it('round-trips saved prefs', () => {
    saveNotifyPrefs({ level: 'MODERATE', scope: 'any', station: 'Kevo' });
    expect(loadNotifyPrefs().level).toBe('MODERATE');
  });

  it('only triggers for my station when scoped', () => {
    expect(
      getTriggeredStations(statuses, { level: 'HIGH', scope: 'station', station: 'Ivalo' }),
    ).toEqual([]);
    expect(
      getTriggeredStations(statuses, { level: 'MODERATE', scope: 'station', station: 'Ivalo' }),
    ).toEqual(['Ivalo']);
  });

  it('triggers for any station by level', () => {
    expect(getTriggeredStations(statuses, { level: 'HIGH', scope: 'any', station: null })).toEqual([
      'Kevo',
    ]);
    expect(
      getTriggeredStations(statuses, { level: 'MODERATE', scope: 'any', station: null }),
    ).toEqual(['Kevo', 'Ivalo']);
  });
});

import { createContext } from 'react';

import { SolarData } from '../services/solarService';

export interface SolarActivityState {
  data: SolarData | null;
  loading: boolean;
  error: boolean;
  lastUpdated: number | null;
  refresh: (showLoading?: boolean) => Promise<void>;
}

export const SolarActivityContext = createContext<SolarActivityState | undefined>(undefined);

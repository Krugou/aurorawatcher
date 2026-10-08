import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { SolarActivityContext } from './SolarActivityContext';
import { fetchSolarData, SolarData } from '../services/solarService';

const REFRESH_INTERVAL = 5 * 60 * 1000;

export const SolarActivityProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SolarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const latest = await fetchSolarData();
      if (!latest) throw new Error('NOAA solar activity data is unavailable');
      setData(latest);
      setError(false);
      setLastUpdated(Date.now());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(true);
    const timer = window.setInterval(() => void refresh(), REFRESH_INTERVAL);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const value = useMemo(
    () => ({ data, loading, error, lastUpdated, refresh }),
    [data, loading, error, lastUpdated, refresh],
  );

  return <SolarActivityContext.Provider value={value}>{children}</SolarActivityContext.Provider>;
};

import { useEffect, useState } from 'react';

import { scanStationStatuses, type StationStatus } from '../utils/auroraUtils';

const AURORA_DATA =
  'https://cdn.fmi.fi/weather-observations/products/magnetic-disturbance-observations/map-latest-fi.png';

/** Scans the FMI disturbance map and returns the status of every station. */
export const useStationStatuses = (timestamp: number) => {
  const [statuses, setStatuses] = useState<StationStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        setStatuses(scanStationStatuses(img));
      } catch {
        setStatuses([]);
      }
      setLoading(false);
    };
    img.onerror = () => {
      if (cancelled) return;
      setStatuses([]);
      setLoading(false);
    };
    img.src = `${AURORA_DATA}?t=${timestamp}`;
    return () => {
      cancelled = true;
    };
  }, [timestamp]);

  return { statuses, loading };
};

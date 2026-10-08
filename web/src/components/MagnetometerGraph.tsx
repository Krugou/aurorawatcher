import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useGeolocation } from '../hooks/useGeolocation';
import { fetchMagnetometerHistory, GraphDataPoint } from '../services/fmiService';
import { DataFreshness, DataStatus } from './DataStatus';
import { Skeleton } from './Skeleton';

const DEFAULT_COORDS = { latitude: 60.1699, longitude: 24.9384 };

export const MagnetometerGraph = ({
  manualCoords,
}: {
  manualCoords?: { latitude: number; longitude: number };
}) => {
  const { t } = useTranslation();
  const { coords, requestLocation, loading: locating, error: locationError } = useGeolocation();
  const [data, setData] = useState<GraphDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [requestId, setRequestId] = useState(0);

  const effectiveCoords = manualCoords || coords || DEFAULT_COORDS;

  useEffect(() => {
    if (effectiveCoords) {
      setLoading(true);
      fetchMagnetometerHistory(effectiveCoords.latitude, effectiveCoords.longitude)
        .then((result) => {
          setData(result);
          setError(false);
          if (result.length > 0) setLastUpdated(Date.now());
        })
        .catch(() => setError(true))
        .finally(() => {
          setLoading(false);
        });
    }
  }, [effectiveCoords, requestId]);

  const retry = () => setRequestId((id) => id + 1);
  const locationButton = (
    <button
      type="button"
      onClick={requestLocation}
      disabled={locating}
      className="rounded-lg border border-white/15 px-3 py-2 font-mono text-xs text-aurora-teal transition hover:border-aurora-teal/40 disabled:opacity-50"
    >
      {locating ? t('graphs.locating') : t('graphs.useLocation')}
    </button>
  );
  const locationHint = (
    <p className="font-mono text-[10px] text-white/40">
      {coords || manualCoords
        ? t('graphs.customLocation')
        : t('graphs.defaultLocation', {
            latitude: DEFAULT_COORDS.latitude,
            longitude: DEFAULT_COORDS.longitude,
          })}
    </p>
  );

  if (loading)
    return (
      <div className="space-y-3">
        {locationButton}
        {locationHint}
        <Skeleton className="h-64 w-full" />
      </div>
    );

  if (error || data.length === 0)
    return (
      <div className="space-y-3">
        {locationButton}
        {locationHint}
        {locationError && <p className="text-xs text-white/45">{t('local.geoError')}</p>}
        <DataStatus
          source={t('data_state.fmi')}
          state={error ? 'error' : 'empty'}
          lastUpdated={lastUpdated}
          onRetry={retry}
        />
      </div>
    );

  // Format time for X-Axis
  const formatTime = (unix: number) => {
    const d = new Date(unix);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {locationHint}
        {locationButton}
      </div>
      <div className="h-[250px] w-full mt-4 overflow-hidden relative rounded-xl bg-white/[0.03] border border-white/10">
        <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#444"
              tick={{ fill: '#888', fontFamily: 'monospace', fontSize: 10 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#444"
              tick={{ fill: '#888', fontFamily: 'monospace', fontSize: 10 }}
              label={{
                value: t('common.unit_mag'),
                angle: -90,
                position: 'insideLeft',
                fill: '#888',
                fontFamily: 'monospace',
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 15, 0.95)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px',
                boxShadow: '0 0 20px rgba(0, 212, 170, 0.1)',
              }}
              itemStyle={{ color: '#00d4aa', fontFamily: 'monospace' }}
              labelStyle={{
                color: '#fff',
                fontWeight: 'bold',
                marginBottom: '4px',
                fontFamily: 'monospace',
              }}
              labelFormatter={(label) => formatTime(label)}
            />
            <ReferenceLine
              y={50000}
              label={{ value: t('graphs.quiet'), fill: '#555', fontFamily: 'monospace' }}
              stroke="#333"
              strokeDasharray="4 4"
            />
            <Line
              type="step"
              dataKey="intensity"
              stroke="#00d4aa"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#00d4aa', stroke: '#0a0a0f', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs font-mono text-white/40 mt-2 text-center uppercase tracking-wider">
        {t('graphs.mag_hint')}
      </p>
      {lastUpdated && <DataFreshness source={t('data_state.fmi')} lastUpdated={lastUpdated} />}
    </div>
  );
};

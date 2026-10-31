import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getStationFeed, getStationsMissingFromFeed, StationSeries } from '../services/stationFeed';
import { DISTURBANCE_THRESHOLDS, DisturbanceStatus } from '../utils/disturbance';
import { normalizeStationKey } from '../utils/i18nUtils';
import { DataFreshness, DataStatus } from './DataStatus';
import { Skeleton } from './Skeleton';

const STATUS_COLOR: Record<DisturbanceStatus, string> = {
  QUIET: '#9ca3af',
  LOW: '#66CCEE',
  MODERATE: '#22c55e',
  HIGH: '#EE6677',
};

const formatTime = (unix: number) =>
  new Date(unix).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const StationChart = ({ series }: { series: StationSeries }) => {
  const { t } = useTranslation();
  const color = STATUS_COLOR[series.status];
  const name = t(`common.loc.${normalizeStationKey(series.name)}`, { defaultValue: series.name });
  const gradientId = `disturbance-${normalizeStationKey(series.name)}`;

  return (
    <li className="neo-card p-3 space-y-2" data-testid="station-chart">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-sans font-bold text-sm text-white/90">{name}</h4>
        <p className="font-mono text-[11px]" style={{ color }}>
          {t(`status.${series.status.toLowerCase()}`)} ·{' '}
          {Math.round(series.latest?.disturbance ?? 0)} {t('common.unit_mag')}
        </p>
      </div>
      <div
        className="h-24 w-full"
        role="img"
        aria-label={t('graphs.stationChartLabel', {
          station: name,
          peak: Math.round(series.peak),
          unit: t('common.unit_mag'),
        })}
      >
        <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
          <AreaChart data={series.samples} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatTime}
              tickCount={4}
              stroke="#444"
              tick={{ fill: '#888', fontFamily: 'monospace', fontSize: 9 }}
            />
            <YAxis
              width={32}
              domain={[
                0,
                (max: number) => Math.max(DISTURBANCE_THRESHOLDS.moderate, Math.ceil(max)),
              ]}
              stroke="#444"
              tick={{ fill: '#888', fontFamily: 'monospace', fontSize: 9 }}
            />
            <ReferenceLine
              y={DISTURBANCE_THRESHOLDS.moderate}
              stroke="#555"
              strokeDasharray="3 3"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 15, 0.95)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: 11,
              }}
              labelFormatter={(label) => formatTime(Number(label))}
              formatter={(value) => [`${String(value)} ${t('common.unit_mag')}`, '']}
            />
            <Area
              type="monotone"
              dataKey="disturbance"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </li>
  );
};

export const StationDisturbanceCharts = () => {
  const { t } = useTranslation();
  const [series, setSeries] = useState<StationSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStationFeed()
      .then((result) => {
        if (cancelled) return;
        setSeries(result);
        setError(false);
        if (result.length > 0) setLastUpdated(Date.now());
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const retry = useCallback(() => setRequestId((id) => id + 1), []);

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (error || series.length === 0)
    return (
      <DataStatus
        source={t('data_state.fmi')}
        state={error ? 'error' : 'empty'}
        lastUpdated={lastUpdated}
        onRetry={retry}
      />
    );

  const missing = getStationsMissingFromFeed(series).map((name) =>
    t(`common.loc.${normalizeStationKey(name)}`, { defaultValue: name }),
  );

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-sans font-bold text-white/80">{t('graphs.stations_title')}</h3>
        <p className="text-xs font-mono text-white/60">{t('graphs.stations_hint')}</p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {series.map((station) => (
          <StationChart key={station.name} series={station} />
        ))}
      </ul>
      {missing.length > 0 && (
        <p className="text-[11px] font-mono text-white/60">
          {t('graphs.stations_missing', { stations: missing.join(', ') })}
        </p>
      )}
      {lastUpdated && <DataFreshness source={t('data_state.fmi')} lastUpdated={lastUpdated} />}
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { fetchSolarHistory, SolarHistoryPoint } from '../services/solarService';
import { Skeleton } from './Skeleton';

export const SolarWindGraph = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<SolarHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSolarHistory()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-64 w-full bg-slate-900 rounded-2xl mb-8" />;
  if (data.length === 0) return null;

  // Filter last 6 hours
  const recentData = data.filter((d) => Date.now() - d.timestamp < 6 * 60 * 60 * 1000);

  const formatTime = (unix: number) => {
    const d = new Date(unix);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <ComposedChart data={recentData}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#64748b"
              tick={{ fill: '#64748b' }}
            />
            {/* Left Axis: Speed */}
            <YAxis
              yAxisId="speed"
              orientation="left"
              stroke="#f59e0b" // Orange/Yellow
              tick={{ fill: '#f59e0b' }}
              label={{ value: 'km/s', angle: -90, position: 'insideLeft', fill: '#f59e0b' }}
              domain={['auto', 'auto']}
            />
            {/* Right Axis: Bz */}
            <YAxis
              yAxisId="bz"
              orientation="right"
              stroke="#f87171" // Red
              tick={{ fill: '#f87171' }}
              label={{ value: 'nT', angle: 90, position: 'insideRight', fill: '#f87171' }}
              domain={[-20, 20]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#020617',
                borderColor: '#334155',
                borderRadius: '12px',
                border: '1px solid #334155',
                padding: '10px',
              }}
              itemStyle={{ color: '#e2e8f0' }}
              labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}
              labelFormatter={(label) => formatTime(label)}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />

            <Area
              yAxisId="speed"
              type="monotone"
              dataKey="speed"
              fill="#f59e0b"
              stroke="#f59e0b"
              fillOpacity={0.1}
              name={t('graphs.speed_label', 'Speed (km/s)')}
            />
            <Line
              yAxisId="bz"
              type="monotone"
              dataKey="bz"
              stroke="#ef4444" // Red
              strokeWidth={2}
              dot={false}
              name={t('graphs.bz_label', 'Bz (nT)')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        {t(
          'graphs.solar_hint',
          'Correlation of High Speed + Negative Bz triggers Geomagnetic Storms.',
        )}
      </p>
    </>
  );
};

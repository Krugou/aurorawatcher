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
import { Skeleton } from './Skeleton';

export const MagnetometerGraph = () => {
  const { t } = useTranslation();
  const { coords } = useGeolocation();
  const [data, setData] = useState<GraphDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coords) {
      setLoading(true);
      fetchMagnetometerHistory(coords.latitude, coords.longitude)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [coords]);

  if (!coords) return null; // Don't show if no location

  if (loading) return <Skeleton className="h-64 w-full bg-slate-900 rounded-2xl" />;

  if (data.length === 0) return null;

  // Format time for X-Axis
  const formatTime = (unix: number) => {
    const d = new Date(unix);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <LineChart data={data}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#64748b"
              tick={{ fill: '#64748b' }}
            />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#64748b"
              tick={{ fill: '#64748b' }}
              label={{ value: 'nT', angle: -90, position: 'insideLeft', fill: '#64748b' }}
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
            <ReferenceLine
              y={50000}
              label={t('graphs.quiet', 'Quiet')}
              stroke="#334155"
              strokeDasharray="3 3"
            />
            {/* We can calculate moving average or baseline to show disturbance 'delta',
                             but raw intensity is a good start.
                             Usually auroras show as sharp drops/spikes in X component or total field. */}
            <Line
              type="monotone"
              dataKey="intensity"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: '#d8b4fe' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        {t('graphs.mag_hint', 'Rapid changes in intensity indicate active auroras overhead.')}
      </p>
    </>
  );
};

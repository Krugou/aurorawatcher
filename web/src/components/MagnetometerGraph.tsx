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

export const MagnetometerGraph = ({
  manualCoords,
}: {
  manualCoords?: { latitude: number; longitude: number };
}) => {
  const { t } = useTranslation();
  const { coords } = useGeolocation();
  const [data, setData] = useState<GraphDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const effectiveCoords = manualCoords || coords;

  useEffect(() => {
    if (effectiveCoords) {
      setLoading(true);
      fetchMagnetometerHistory(effectiveCoords.latitude, effectiveCoords.longitude)
        .then(setData)
        .catch(console.error)
        .finally(() => {
          setLoading(false);
        });
    }
  }, [effectiveCoords]);

  if (!effectiveCoords) return null; // Don't show if no location

  if (loading) return <Skeleton className="h-64 w-full" />;

  if (data.length === 0) return null;

  // Format time for X-Axis
  const formatTime = (unix: number) => {
    const d = new Date(unix);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
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
    </>
  );
};

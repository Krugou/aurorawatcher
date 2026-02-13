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

  if (loading) return <Skeleton className="h-64 w-full bg-slate-900" />;

  if (data.length === 0) return null;

  // Format time for X-Axis
  const formatTime = (unix: number) => {
    const d = new Date(unix);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="h-[250px] w-full mt-4 overflow-hidden relative bg-gray-100 dark:bg-zinc-900 border-2 border-black dark:border-white shadow-neo-sm">
        <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#000"
              tick={{ fill: '#000', fontFamily: 'monospace', fontSize: 10 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#000"
              tick={{ fill: '#000', fontFamily: 'monospace', fontSize: 10 }}
              label={{
                value: 'nT',
                angle: -90,
                position: 'insideLeft',
                fill: '#000',
                fontFamily: 'monospace',
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#000',
                borderColor: '#fff',
                borderRadius: '0px',
                border: '2px solid #fff',
                padding: '10px',
                boxShadow: '4px 4px 0px 0px #fff',
              }}
              itemStyle={{ color: '#00FF9D', fontFamily: 'monospace' }}
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
              label={{ value: t('graphs.quiet'), fill: '#666', fontFamily: 'monospace' }}
              stroke="#666"
              strokeDasharray="4 4"
            />
            <Line
              type="step"
              dataKey="intensity"
              stroke="#00FF9D"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#fff', stroke: '#000', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs font-mono text-black dark:text-white mt-2 text-center uppercase tracking-wider">
        {t('graphs.mag_hint')}
      </p>
    </>
  );
};

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
      .finally(() => {
        setLoading(false);
      });
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
      <div className="h-[250px] w-full mt-4 overflow-hidden relative bg-gray-100 dark:bg-zinc-900 border-2 border-black dark:border-white shadow-neo-sm">
        <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
          <ComposedChart data={recentData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#000"
              tick={{ fill: '#000', fontFamily: 'monospace', fontSize: 10 }}
            />
            {/* Left Axis: Speed */}
            <YAxis
              yAxisId="speed"
              orientation="left"
              stroke="#000"
              tick={{ fill: '#000', fontFamily: 'monospace', fontSize: 10 }}
              label={{
                value: 'km/s',
                angle: -90,
                position: 'insideLeft',
                fill: '#000',
                fontFamily: 'monospace',
              }}
              domain={['auto', 'auto']}
            />
            {/* Right Axis: Bz */}
            <YAxis
              yAxisId="bz"
              orientation="right"
              stroke="#FF4800"
              tick={{ fill: '#FF4800', fontFamily: 'monospace', fontSize: 10 }}
              label={{
                value: 'nT',
                angle: 90,
                position: 'insideRight',
                fill: '#FF4800',
                fontFamily: 'monospace',
              }}
              domain={[-20, 20]}
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
              itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
              labelStyle={{
                color: '#fff',
                fontWeight: 'bold',
                marginBottom: '4px',
                fontFamily: 'monospace',
              }}
              labelFormatter={(label) => formatTime(label)}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontFamily: 'monospace' }} />

            <Area
              yAxisId="speed"
              type="step"
              dataKey="speed"
              fill="#FFDE00"
              stroke="#FFDE00"
              stokeWidth={2}
              fillOpacity={0.2}
              name={t('graphs.speed_label', 'SPEED (km/s)')}
            />
            <Line
              yAxisId="bz"
              type="step"
              dataKey="bz"
              stroke="#FF4800"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#fff', stroke: '#000', strokeWidth: 2 }}
              name={t('graphs.bz_label', 'Bz (nT)')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs font-mono text-black dark:text-white mt-2 text-center uppercase tracking-wider">
        {t(
          'graphs.solar_hint',
          'Correlation of High Speed + Negative Bz triggers Geomagnetic Storms.',
        )}
      </p>
    </>
  );
};

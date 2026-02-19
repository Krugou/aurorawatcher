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

  if (loading) return <Skeleton className="h-64 w-full mb-8" />;
  if (data.length === 0) return null;

  // Filter last 6 hours
  const recentData = data.filter((d) => Date.now() - d.timestamp < 6 * 60 * 60 * 1000);

  const formatTime = (unix: number) => {
    const d = new Date(unix);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="h-[250px] w-full mt-4 overflow-hidden relative rounded-xl bg-white/[0.03] border border-white/10">
        <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
          <ComposedChart data={recentData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTime}
              stroke="#444"
              tick={{ fill: '#888', fontFamily: 'monospace', fontSize: 10 }}
            />
            {/* Left Axis: Speed */}
            <YAxis
              yAxisId="speed"
              orientation="left"
              stroke="#444"
              tick={{ fill: '#888', fontFamily: 'monospace', fontSize: 10 }}
              label={{
                value: t('common.unit_speed'),
                angle: -90,
                position: 'insideLeft',
                fill: '#888',
                fontFamily: 'monospace',
              }}
              domain={['auto', 'auto']}
            />
            {/* Right Axis: Bz */}
            <YAxis
              yAxisId="bz"
              orientation="right"
              stroke="#8b5cf6"
              tick={{ fill: '#8b5cf6', fontFamily: 'monospace', fontSize: 10 }}
              label={{
                value: t('common.unit_mag'),
                angle: 90,
                position: 'insideRight',
                fill: '#8b5cf6',
                fontFamily: 'monospace',
              }}
              domain={[-20, 20]}
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
              itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
              labelStyle={{
                color: '#fff',
                fontWeight: 'bold',
                marginBottom: '4px',
                fontFamily: 'monospace',
              }}
              labelFormatter={(label) => formatTime(label)}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontFamily: 'monospace', color: '#888' }} />

            <Area
              yAxisId="speed"
              type="step"
              dataKey="speed"
              fill="#00d4aa"
              stroke="#00d4aa"
              strokeWidth={2}
              fillOpacity={0.1}
              name={t('graphs.speed_label')}
            />
            <Line
              yAxisId="bz"
              type="step"
              dataKey="bz"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#0a0a0f', strokeWidth: 2 }}
              name={t('graphs.bz_label')}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs font-mono text-white/40 mt-2 text-center uppercase tracking-wider">
        {t('graphs.solar_hint')}
      </p>
    </>
  );
};

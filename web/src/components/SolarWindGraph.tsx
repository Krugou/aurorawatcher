import { useEffect, useState } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
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
    const recentData = data.filter(d => Date.now() - d.timestamp < 6 * 60 * 60 * 1000);

    const formatTime = (unix: number) => {
        const d = new Date(unix);
        return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800/50 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 pl-2 border-l-4 border-orange-500">
                {t('graphs.solar_title', 'Solar Wind & Bz (Last 6h)')}
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
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
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                            labelFormatter={(label) => formatTime(label)}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }}/>

                        <Area
                            yAxisId="speed"
                            type="monotone"
                            dataKey="speed"
                            fill="#f59e0b"
                            stroke="#f59e0b"
                            fillOpacity={0.1}
                            name="Speed (km/s)"
                        />
                        <Line
                            yAxisId="bz"
                            type="monotone"
                            dataKey="bz"
                            stroke="#ef4444" // Red
                            strokeWidth={2}
                            dot={false}
                            name="Bz (nT)"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
                {t('graphs.solar_hint', 'Correlation of High Speed + Negative Bz triggers Geomagnetic Storms.')}
            </p>
        </div>
    );
};

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { fetchSolarData, SolarData } from '../services/solarService';
import { Skeleton } from './Skeleton';

export const SpaceWeather = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<SolarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await fetchSolarData();
      setData(result);
      setLoading(false);
    };
    load();

    // Refresh every minute
    const interval = setInterval(load, 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full bg-slate-800" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Helpers for coloring
  const getBzColor = (val: number) =>
    val < -5 ? 'text-red-500' : val < 0 ? 'text-green-400' : 'text-slate-400';
  const getSpeedColor = (val: number) =>
    val > 600 ? 'text-red-500' : val > 500 ? 'text-yellow-400' : 'text-slate-400';
  const getDensityColor = (val: number) =>
    val > 20 ? 'text-red-500' : val > 10 ? 'text-yellow-400' : 'text-slate-400';
  const getKpColor = (val: number) =>
    val >= 5 ? 'text-red-500' : val >= 4 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Bz */}
      <div className="bg-white dark:bg-black p-4 border-2 border-black dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-black dark:text-white mb-2 bg-neo-yellow inline-block px-1">
          {t('space_weather.bz', 'Bz (IMF)')}
        </p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-4xl font-display font-bold ${getBzColor(data.bz)}`}>
            {data.bz}
          </span>
          <span className="text-xs font-mono text-gray-500">nT</span>
        </div>
        <p className="text-[10px] font-mono text-gray-400 mt-2 uppercase">
          {t('space_weather.bz_hint', 'Negative is better')}
        </p>
      </div>

      {/* Speed */}
      <div className="bg-white dark:bg-black p-4 border-2 border-black dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-black dark:text-white mb-2 bg-neo-blue inline-block px-1">
          {t('space_weather.speed', 'Solar Wind')}
        </p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-4xl font-display font-bold ${getSpeedColor(data.speed)}`}>
            {Math.round(data.speed)}
          </span>
          <span className="text-xs font-mono text-gray-500">km/s</span>
        </div>
        <p className="text-[10px] font-mono text-gray-400 mt-2 uppercase">
          {t('space_weather.speed_hint', 'Faster is better')}
        </p>
      </div>

      {/* Density */}
      <div className="bg-white dark:bg-black p-4 border-2 border-black dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-black dark:text-white mb-2 bg-neo-pink inline-block px-1">
          {t('space_weather.density', 'Density')}
        </p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-4xl font-display font-bold ${getDensityColor(data.density)}`}>
            {Math.round(data.density)}
          </span>
          <span className="text-xs font-mono text-gray-500">p/cm³</span>
        </div>
        <p className="text-[10px] font-mono text-gray-400 mt-2 uppercase">
          {t('space_weather.density_hint', 'Higher is better')}
        </p>
      </div>

      {/* Kp Index */}
      <div className="bg-white dark:bg-black p-4 border-2 border-black dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-black dark:text-white mb-2 bg-neo-mint inline-block px-1">
          {t('space_weather.kp', 'Kp Index')}
        </p>
        <div className="flex flex-col gap-2 mt-2">
          <span className={`text-4xl font-display font-bold ${getKpColor(data.kp)}`}>
            {data.kp}
          </span>
          <div className="flex gap-1 h-4 w-full">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
              <div
                key={level}
                className={`flex-1 border border-black dark:border-white ${level < data.kp ? (level >= 5 ? 'bg-red-500' : 'bg-neo-mint') : 'bg-transparent'}`}
              />
            ))}
          </div>
        </div>
        <p className="text-[10px] font-mono text-gray-400 mt-2 uppercase">
          {t('space_weather.kp_hint', 'Planetary Activity')}
        </p>
      </div>
    </div>
  );
};

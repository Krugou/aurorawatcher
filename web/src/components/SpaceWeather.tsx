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
    val < -5 ? 'text-red-600' : val < 0 ? 'text-green-600' : 'text-slate-500';
  const getSpeedColor = (val: number) =>
    val > 600 ? 'text-red-500' : val > 500 ? 'text-yellow-600' : 'text-slate-500';
  const getDensityColor = (val: number) =>
    val > 20 ? 'text-red-500' : val > 10 ? 'text-yellow-600' : 'text-slate-500';
  const getKpColor = (val: number) =>
    val >= 5 ? 'text-red-600' : val >= 4 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Bz */}
      <div className="bg-white dark:bg-black p-4 border-2 border-black dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-black dark:text-white mb-2 bg-neo-yellow inline-block px-1">
          {t('space_weather.bz')}
        </p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-4xl font-display font-bold ${getBzColor(data.bz)}`}>
            {data.bz}
          </span>
          <span className="text-xs font-mono text-gray-500">{t('common.unit_mag')}</span>
        </div>
        <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase">
          {t('space_weather.bz_hint')}
        </p>
      </div>

      {/* Speed */}
      <div className="bg-white dark:bg-black p-4 border-2 border-black dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-2 bg-neo-blue inline-block px-1">
          {t('space_weather.speed')}
        </p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-4xl font-display font-bold ${getSpeedColor(data.speed)}`}>
            {Math.round(data.speed)}
          </span>
          <span className="text-xs font-mono text-gray-500">{t('common.unit_speed')}</span>
        </div>
        <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase">
          {t('space_weather.speed_hint')}
        </p>
      </div>

      {/* Density */}
      <div className="bg-white dark:bg-black p-4 border-2 border-black dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-black dark:text-white mb-2 bg-neo-pink inline-block px-1">
          {t('space_weather.density')}
        </p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-4xl font-display font-bold ${getDensityColor(data.density)}`}>
            {Math.round(data.density)}
          </span>
          <span className="text-xs font-mono text-gray-500">{t('common.unit_density')}</span>
        </div>
        <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase">
          {t('space_weather.density_hint')}
        </p>
      </div>

      {/* Kp Index */}
      <div className="bg-white dark:bg-black p-4 border-2 border-black dark:border-white shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group">
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-black dark:text-white mb-2 bg-neo-mint inline-block px-1">
          {t('space_weather.kp')}
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
        <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase">
          {t('space_weather.kp_hint')}
        </p>
      </div>
    </div>
  );
};

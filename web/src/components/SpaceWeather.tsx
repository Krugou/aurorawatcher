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
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Helpers for coloring
  const getBzColor = (val: number) =>
    val < -5 ? 'text-red-400' : val < 0 ? 'text-aurora-teal' : 'text-white/50';
  const getSpeedColor = (val: number) =>
    val > 600 ? 'text-red-400' : val > 500 ? 'text-amber-400' : 'text-white/50';
  const getDensityColor = (val: number) =>
    val > 20 ? 'text-red-400' : val > 10 ? 'text-amber-400' : 'text-white/50';
  const getKpColor = (val: number) =>
    val >= 5 ? 'text-red-400' : val >= 4 ? 'text-amber-400' : 'text-aurora-teal';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Bz */}
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:border-white/20 transition-all duration-300 group">
        <p className="text-xs font-mono font-medium uppercase tracking-widest text-aurora-teal/80 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-aurora-teal shadow-[0_0_6px_rgba(0,212,170,0.5)] animate-pulse" />
          {t('space_weather.bz')}
        </p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-4xl font-sans font-bold ${getBzColor(data.bz)}`}>{data.bz}</span>
          <span className="text-xs font-mono text-white/30">{t('common.unit_mag')}</span>
        </div>
        <p className="text-[10px] font-mono text-white/30 mt-2">{t('space_weather.bz_hint')}</p>
      </div>

      {/* Speed */}
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:border-white/20 transition-all duration-300 group">
        <p className="text-xs font-mono font-medium uppercase tracking-widest text-aurora-blue/80 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-aurora-blue shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
          {t('space_weather.speed')}
        </p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-4xl font-sans font-bold ${getSpeedColor(data.speed)}`}>
            {Math.round(data.speed)}
          </span>
          <span className="text-xs font-mono text-white/30">{t('common.unit_speed')}</span>
        </div>
        <p className="text-[10px] font-mono text-white/30 mt-2">{t('space_weather.speed_hint')}</p>
      </div>

      {/* Density */}
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:border-white/20 transition-all duration-300 group">
        <p className="text-xs font-mono font-medium uppercase tracking-widest text-aurora-rose/80 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-aurora-rose shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
          {t('space_weather.density')}
        </p>
        <div className="flex items-baseline gap-1 mt-2">
          <span className={`text-4xl font-sans font-bold ${getDensityColor(data.density)}`}>
            {Math.round(data.density)}
          </span>
          <span className="text-xs font-mono text-white/30">{t('common.unit_density')}</span>
        </div>
        <p className="text-[10px] font-mono text-white/30 mt-2">
          {t('space_weather.density_hint')}
        </p>
      </div>

      {/* Kp Index */}
      <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 hover:border-white/20 transition-all duration-300 group">
        <p className="text-xs font-mono font-medium uppercase tracking-widest text-aurora-cyan/80 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-aurora-cyan shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
          {t('space_weather.kp')}
        </p>
        <div className="flex flex-col gap-2 mt-2">
          <span className={`text-4xl font-sans font-bold ${getKpColor(data.kp)}`}>{data.kp}</span>
          <div className="flex gap-1 h-3 w-full">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
              <div
                key={level}
                className={`flex-1 rounded-sm border border-white/10 transition-colors duration-500 ${level < data.kp ? (level >= 5 ? 'bg-red-500/80' : 'bg-aurora-teal/80') : 'bg-white/5'}`}
              />
            ))}
          </div>
        </div>
        <p className="text-[10px] font-mono text-white/30 mt-2">{t('space_weather.kp_hint')}</p>
      </div>
    </div>
  );
};

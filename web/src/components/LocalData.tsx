import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGeolocation } from '../hooks/useGeolocation';
import { fetchMagneticData, fetchWeatherData } from '../services/fmiService';
import { fetchSolarData, SolarData } from '../services/solarService';
import { fetchNorwayWeather } from '../services/weatherService';
import { isDaytime } from '../utils/daytime';
import { normalizeStationKey } from '../utils/i18nUtils';
import { AuroraGauge } from './AuroraGauge';
import { Skeleton } from './Skeleton';

interface CombinedData {
  magStation: string;
  fieldIntensity: number;
  weatherStation: string;
  temperature: number;
  cloudCover: number;
  windSpeed: number;
  description?: string;
  solar: SolarData | null;
}

export const LocalData = ({
  manualCoords,
}: {
  manualCoords?: { latitude: number; longitude: number };
}) => {
  const { t } = useTranslation();
  const { coords, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const [data, setData] = useState<CombinedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const effectiveCoords = manualCoords ?? coords;

  useEffect(() => {
    if (effectiveCoords) {
      console.log('[LocalData] Fetching for coords:', effectiveCoords);
      setLoading(true);
      setError(false); // Reset error state on new fetch attempt
      Promise.all([
        fetchMagneticData(effectiveCoords.latitude, effectiveCoords.longitude),
        fetchSolarData(),
        fetchWeatherData(effectiveCoords.latitude, effectiveCoords.longitude).then(async (res) => {
          if (!res) {
            console.warn('[LocalData] FMI Weather failed, trying MET Norway fallback...');
            try {
              const norway = await fetchNorwayWeather(
                effectiveCoords.latitude,
                effectiveCoords.longitude,
              );
              return {
                station: norway.location,
                temperature: norway.temperature,
                cloudCover: 0,
                windSpeed: 0,
                _isFallback: true,
                description: norway.description,
              };
            } catch (e: unknown) {
              console.error('[LocalData] MET Norway fallback also failed:', e);
              return null;
            }
          }
          return res;
        }),
      ])
        .then(([magResult, solarResult, weatherResult]) => {
          console.log('[LocalData] Fetch results:', { magResult, solarResult, weatherResult });
          if (magResult && weatherResult) {
            setData({
              magStation: magResult.station,
              fieldIntensity: magResult.fieldIntensity,
              weatherStation: weatherResult.station,
              temperature: weatherResult.temperature,
              cloudCover: weatherResult.cloudCover,
              windSpeed: weatherResult.windSpeed,
              description: (weatherResult as { description?: string }).description,
              solar: solarResult,
            });
          } else {
            console.warn('[LocalData] One or more datasets missing');
            setError(true);
          }
        })
        .catch((err: unknown) => {
          console.error('[LocalData] Fetch error:', err);
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('[LocalData] No coords available yet');
    }
  }, [effectiveCoords]);

  // Cloud cover interpretation (0-8 octas)
  const getSkyCondition = (octas: number, description?: string) => {
    if (description)
      return {
        text: description.charAt(0).toUpperCase() + description.slice(1),
        color: 'text-aurora-blue',
      };
    if (octas <= 1) return { text: t('sky.clear'), color: 'text-aurora-teal' };
    if (octas <= 4) return { text: t('sky.partly'), color: 'text-amber-400' };
    return { text: t('sky.overcast'), color: 'text-white/40' };
  };

  const sky = data ? getSkyCondition(data.cloudCover, data.description) : { text: '', color: '' };

  if (!effectiveCoords && !geoLoading && !geoError) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-6 rounded-xl bg-white/[0.03] border border-white/10">
        <div className="w-14 h-14 rounded-2xl bg-aurora-blue/10 flex items-center justify-center mb-5 border border-aurora-blue/20">
          <span className="text-2xl">📍</span>
        </div>
        <p className="text-white/60 font-mono text-sm mb-6 max-w-md">{t('local.prompt')}</p>
        <button
          onClick={requestLocation}
          className="bg-gradient-to-r from-aurora-teal to-aurora-blue text-white px-8 py-3 font-semibold font-mono rounded-xl hover:shadow-[0_0_25px_rgba(0,212,170,0.3)] transition-all duration-300"
        >
          {t('local.button')}
        </button>
      </div>
    );
  }

  return (
    <>
      {geoLoading || loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : geoError ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-center p-6">
          <p className="font-mono font-medium text-red-400">{t('local.geoError')}</p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 text-center p-6">
          <p className="font-mono font-medium text-amber-400">{t('local.dataError')}</p>
        </div>
      ) : data ? (
        effectiveCoords && isDaytime(effectiveCoords.latitude, effectiveCoords.longitude) ? (
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 text-center p-8">
            <div className="text-6xl mb-4">☀️</div>
            <h3 className="text-2xl font-sans font-bold mb-2 text-white/90">
              {t('local.daytime_title')}
            </h3>
            <p className="font-mono text-sm text-white/50">{t('local.daytime_desc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
            {/* Magnetic Field Card */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-col justify-between group hover:bg-white/[0.02] transition-colors duration-300">
              <div>
                <p className="text-sm font-mono font-medium uppercase tracking-widest text-aurora-rose/80 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-aurora-rose shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
                  {t('local.magField')}
                </p>
                <p className="text-xs font-mono text-white/40">
                  {t('common.station')}:{' '}
                  {t(`common.loc.${normalizeStationKey(data.magStation)}`, {
                    defaultValue: data.magStation,
                  })}
                </p>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-sans font-bold text-white group-hover:text-aurora-rose transition-colors duration-300">
                    {data.fieldIntensity}
                  </span>
                  <span className="text-sm font-mono text-white/30">{t('common.unit_mag')}</span>
                </div>
                <p className="text-xs font-mono text-white/50 mt-1">{t('local.intensity')}</p>
              </div>
            </div>

            {/* Visibility Card */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-col justify-between group hover:bg-white/[0.02] transition-colors duration-300">
              <p className="text-sm font-mono font-medium uppercase tracking-widest text-aurora-blue/80 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-aurora-blue shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                {t('local.visibility')}
              </p>
              <div className="mt-4">
                <p className={`text-2xl font-sans font-bold text-white/90`}>{sky.text}</p>
                <p className="text-sm font-mono text-white/40 mt-1">
                  {t('local.clouds', {
                    percent: Math.round((data.cloudCover / 8) * 100),
                  })}
                </p>
              </div>
            </div>

            {/* Conditions Card */}
            <div className="p-6 flex flex-col justify-between group hover:bg-white/[0.02] transition-colors duration-300">
              <p className="text-sm font-mono font-medium uppercase tracking-widest text-amber-400/80 mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
                {t('local.outdoors')}
              </p>
              <div className="mt-4 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-4xl font-sans font-bold text-white">
                    {data.temperature}°C
                  </span>
                  <p className="text-xs font-mono text-white/40 mt-1">
                    {t('local.wind', {
                      speed: data.windSpeed,
                    })}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  {/* Aurora Gauge */}
                  <div className="flex justify-center md:justify-end">
                    <AuroraGauge
                      cloudCover={data.cloudCover}
                      kp={data.solar?.kp ?? 0}
                      bz={data.solar?.bz ?? 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      ) : null}
      {/* Latitude Warning */}
      {effectiveCoords && effectiveCoords.latitude < 62 && (data?.solar?.kp ?? 0) < 5 && (
        <div className="mt-4 rounded-xl bg-aurora-blue/5 border border-aurora-blue/20 p-4 text-center">
          <p className="font-mono font-medium text-aurora-blue text-sm">
            ⚠️ {t('local.lat_warning')}
          </p>
        </div>
      )}{' '}
    </>
  );
};

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGeolocation } from '../hooks/useGeolocation';
import { fetchMagneticData, fetchWeatherData } from '../services/fmiService';
import { fetchNorwayWeather } from '../services/weatherService';
import { Skeleton } from './Skeleton';

interface CombinedData {
  magStation: string;
  fieldIntensity: number;
  weatherStation: string;
  temperature: number;
  cloudCover: number;
  windSpeed: number;
  description?: string;
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

  const effectiveCoords = manualCoords || coords;

  useEffect(() => {
    if (effectiveCoords) {
      console.log('[LocalData] Fetching for coords:', effectiveCoords);
      setLoading(true);
      setError(false); // Reset error state on new fetch attempt
      Promise.all([
        fetchMagneticData(effectiveCoords.latitude, effectiveCoords.longitude),
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
        .then(([magResult, weatherResult]) => {
          console.log('[LocalData] Fetch results:', { magResult, weatherResult });
          if (magResult && weatherResult) {
            setData({
              magStation: magResult.station,
              fieldIntensity: magResult.fieldIntensity,
              weatherStation: weatherResult.station,
              temperature: weatherResult.temperature,
              cloudCover: weatherResult.cloudCover,
              windSpeed: weatherResult.windSpeed,
              description: (weatherResult as { description?: string }).description,
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
        color: 'text-blue-400',
      };
    if (octas <= 1) return { text: t('sky.clear'), color: 'text-green-400' };
    if (octas <= 4) return { text: t('sky.partly'), color: 'text-yellow-400' };
    return { text: t('sky.overcast'), color: 'text-slate-400' };
  };

  const sky = data ? getSkyCondition(data.cloudCover, data.description) : { text: '', color: '' };

  if (!effectiveCoords && !geoLoading && !geoError) {
    return (
      <div className="flex flex-col items-center text-center py-8 px-4 border-2 border-black dark:border-white bg-white dark:bg-black shadow-neo dark:shadow-neo-dark">
        <div className="w-16 h-16 bg-neo-blue flex items-center justify-center mb-4 border-2 border-black">
          <span className="text-3xl">📍</span>
        </div>
        <p className="text-black dark:text-white font-mono text-sm mb-6 max-w-md uppercase">
          {t('local.prompt')}
        </p>
        <button
          onClick={requestLocation}
          className="bg-neo-mint text-black px-8 py-3 font-bold font-mono uppercase border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
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
          <Skeleton className="h-40 w-full bg-slate-800" />
          <Skeleton className="h-40 w-full bg-slate-800" />
          <Skeleton className="h-40 w-full bg-slate-800" />
        </div>
      ) : geoError ? (
        <div className="bg-neo-pink text-black text-center p-6 border-2 border-black">
          <p className="font-mono font-bold uppercase">{t('local.geoError')}</p>
        </div>
      ) : error ? (
        <div className="bg-neo-yellow text-black text-center p-6 border-2 border-black">
          <p className="font-mono font-bold uppercase">{t('local.dataError')}</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black dark:border-white shadow-neo dark:shadow-neo-dark bg-white dark:bg-black">
          {/* Magnetic Field Card */}
          <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white flex flex-col justify-between group hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
            <div>
              <p className="text-sm font-mono font-bold uppercase tracking-widest text-black dark:text-white mb-2 bg-neo-pink inline-block px-2">
                {t('local.magField')}
              </p>
              <p className="text-xs font-mono text-gray-500 uppercase">
                {t('common.station')}:{' '}
                {t(
                  `common.loc.${(data.magStation || '')
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')}`,
                  { defaultValue: data.magStation },
                )}
              </p>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-bold text-black dark:text-white group-hover:text-neo-pink transition-colors">
                  {data.fieldIntensity}
                </span>
                <span className="text-sm font-mono text-gray-500">{t('common.unit_mag')}</span>
              </div>
              <p className="text-xs font-mono text-black dark:text-white mt-1 uppercase">
                {t('local.intensity')}
              </p>
            </div>
          </div>

          {/* Visibility Card */}
          <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white flex flex-col justify-between group hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
            <p className="text-sm font-mono font-bold uppercase tracking-widest text-black dark:text-white mb-2 bg-neo-blue inline-block px-2">
              {t('local.visibility')}
            </p>
            <div className="mt-4">
              <p className={`text-2xl font-display font-bold text-black dark:text-white uppercase`}>
                {sky.text}
              </p>
              <p className="text-sm font-mono text-gray-500 mt-1 uppercase">
                {t('local.clouds', {
                  percent: Math.round((data.cloudCover / 8) * 100),
                })}
              </p>
            </div>
          </div>

          {/* Conditions Card */}
          <div className="p-6 flex flex-col justify-between group hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors">
            <p className="text-sm font-mono font-bold uppercase tracking-widest text-black dark:text-white mb-2 bg-neo-yellow inline-block px-2">
              {t('local.outdoors')}
            </p>
            <div className="mt-4 flex flex-col justify-between gap-4">
              <div>
                <span className="text-4xl font-display font-bold text-black dark:text-white">
                  {data.temperature}°C
                </span>
                <p className="text-xs font-mono text-gray-500 mt-1 uppercase">
                  {t('local.wind', {
                    speed: data.windSpeed,
                  })}
                </p>
              </div>
              <div className="text-left md:text-right">
                {/* Randomized Funny Verdicts */}
                {(() => {
                  const isGood = data.cloudCover <= 3;
                  const goVerdicts = [
                    t('local.go1'),
                    t('local.go2'),
                    t('local.go3'),
                    t('local.go4'),
                    t('local.go5'),
                    t('local.go6'),
                    t('local.go7'),
                    t('local.go8'),
                    t('local.go9'),
                    t('local.go10'),
                  ];
                  const noGoVerdicts = [
                    t('local.noGo1'),
                    t('local.noGo2'),
                    t('local.noGo3'),
                    t('local.noGo4'),
                    t('local.noGo5'),
                    t('local.noGo6'),
                    t('local.noGo7'),
                    t('local.noGo8'),
                    t('local.noGo9'),
                    t('local.noGo10'),
                  ];

                  const verdicts = isGood ? goVerdicts : noGoVerdicts;
                  const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];

                  return (
                    <span
                      className={`px-3 py-1 ${isGood ? 'bg-neo-mint text-black border-black/10' : 'bg-red-500 text-white border-red-900'} text-xs font-bold font-mono uppercase tracking-wide border-2 border-black inline-block shadow-neo-sm transform -rotate-1`}
                    >
                      {verdict}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

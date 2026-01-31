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
            } catch (e) {
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
        .catch((err) => {
          console.error('[LocalData] Fetch error:', err);
          setError(true);
        })
        .finally(() => setLoading(false));
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
    if (octas <= 1) return { text: t('sky.clear', 'Clear Sky 🌌'), color: 'text-green-400' };
    if (octas <= 4) return { text: t('sky.partly', 'Partly Cloudy ⛅'), color: 'text-yellow-400' };
    return { text: t('sky.overcast', 'Overcast ☁️'), color: 'text-slate-400' };
  };

  const sky = data ? getSkyCondition(data.cloudCover, data.description) : { text: '', color: '' };

  if (!effectiveCoords && !geoLoading && !geoError) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">📍</span>
        </div>
        <p className="text-slate-400 mb-6 max-w-md">
          {t(
            'local.prompt',
            'Enable geolocation to see real-time magnetic field and weather conditions for your exact location.',
          )}
        </p>
        <button
          onClick={requestLocation}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 text-lg shadow-lg shadow-blue-900/20"
        >
          {t('local.button', 'Locate Me & Check Conditions')}
        </button>
      </div>
    );
  }

  return (
    <>
      {geoLoading || loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full bg-slate-800 rounded-xl" />
          <Skeleton className="h-24 w-full bg-slate-800 rounded-xl" />
          <Skeleton className="h-24 w-full bg-slate-800 rounded-xl" />
        </div>
      ) : geoError ? (
        <div className="bg-red-900/20 border border-red-900/50 text-red-400 text-center p-6 rounded-xl">
          {t('local.geoError', 'Could not determine location. Please allow location access.')}
        </div>
      ) : error ? (
        <div className="bg-slate-800/50 border border-slate-700/50 text-slate-400 text-center p-6 rounded-xl">
          {t('local.dataError', 'No data available for your area right now.')}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Magnetic Field Card */}
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 flex flex-col justify-between hover-lift">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                {t('local.magField', 'Magnetic Field')}
              </p>
              <p className="text-xs text-slate-500">{data.magStation}</p>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{data.fieldIntensity}</span>
                <span className="text-sm text-slate-500">nT</span>
              </div>
              <p className="text-xs text-purple-400 mt-1">
                {t('local.intensity', 'Raw Intensity (Total)')}
              </p>
            </div>
          </div>

          {/* Visibility Card */}
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 flex flex-col justify-between hover-lift">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
              {t('local.visibility', 'Visibility')}
            </p>
            <div className="mt-4">
              <p className={`text-2xl font-bold ${sky.color}`}>{sky.text}</p>
              <p className="text-sm text-slate-500 mt-1">
                {t('local.clouds', {
                  percent: Math.round((data.cloudCover / 8) * 100),
                  defaultValue: 'Cloud Cover: {{percent}}%',
                })}
              </p>
            </div>
          </div>

          {/* Conditions Card */}
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 flex flex-col justify-between hover-lift">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
              {t('local.outdoors', 'Outdoors')}
            </p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold text-white">{data.temperature}°C</span>
                <p className="text-xs text-slate-500 mt-1">
                  {t('local.wind', { speed: data.windSpeed, defaultValue: 'Wind: {{speed}} m/s' })}
                </p>
              </div>
              <div className="text-right">
                {/* Randomized Funny Verdicts */}
                {(() => {
                  const isGood = data.cloudCover <= 3;
                  const goVerdicts = [
                    t('local.go1', 'GO FOR IT! 🚀'),
                    t('local.go2', "SKY'S NAKED! 🌌"),
                    t('local.go3', 'AURORA BAIT LOCATED 🎣'),
                    t('local.go4', 'PUT YOUR SHOES ON! 👟'),
                    t('local.go5', 'SPACE PARTY ENABLING 👽'),
                    t('local.go6', 'BEST VIEW IN HELSINKI? 🇫🇮'),
                    t('local.go7', 'COFFEE IS READY, GO! ☕'),
                    t('local.go8', 'BETTER THAN NETFLIX 📺'),
                    t('local.go9', 'CLEAREST NIGHT EVER? 💎'),
                    t('local.go10', 'UNLEASH THE CAMERA! 📸'),
                  ];
                  const noGoVerdicts = [
                    t('local.noGo1', 'BAD VISIBILITY ☁️'),
                    t('local.noGo2', 'STAY ON THE SOFA 🛋️'),
                    t('local.noGo3', "CLOUD PARTY (YOU'RE NOT INVITED) ☁️"),
                    t('local.noGo4', 'PERFECT NIGHT FOR TEA 🫖'),
                    t('local.noGo5', 'TOTAL WHITE-OUT 🌫️'),
                    t('local.noGo6', 'AURORAS ARE HIDING 🙈'),
                    t('local.noGo7', 'CLOUDS: 1, YOU: 0 ⚽'),
                    t('local.noGo8', 'TRY AGAIN LATER... 😴'),
                    t('local.noGo9', 'NICE VIEW OF WATER VAPOR �'),
                    t('local.noGo10', 'NETFLIX & NO CHILL 🍿'),
                  ];

                  // Use temperature as a seed or just random (it will change on re-render, adding to the "funny" aspect)
                  const verdicts = isGood ? goVerdicts : noGoVerdicts;
                  const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];

                  return (
                    <span
                      className={`px-3 py-1 ${isGood ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} text-xs font-bold rounded-full border animate-pulse`}
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

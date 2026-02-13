import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useGeolocation } from '../hooks/useGeolocation';
import {
  checkImageColor,
  findNearestStation,
  scanStationStatuses,
  StationStatus,
} from '../utils/auroraUtils';
import { Skeleton } from './Skeleton';

const AURORA_DATA =
  'https://cdn.fmi.fi/weather-observations/products/magnetic-disturbance-observations/map-latest-fi.png';
const INFO_URL = 'https://www.ilmatieteenlaitos.fi/revontulet-ja-avaruussaa';

interface AuroraMapProps {
  timestamp: number;
}

export const AuroraMap = ({ timestamp }: AuroraMapProps) => {
  const { t } = useTranslation();
  const { coords } = useGeolocation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [stationStatuses, setStationStatuses] = useState<StationStatus[]>([]);
  const [nearestStation, setNearestStation] = useState<string | null>(null);
  const [savedStation, setSavedStation] = useState<string | null>(() => {
    return localStorage.getItem('aurora_saved_station');
  });

  const lastToastTimeRef = useRef<number>(0);

  // Reset states when timestamp changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setStationStatuses([]);
  }, [timestamp]);

  // Find nearest station when coords change and auto-save it
  useEffect(() => {
    if (coords) {
      const nearest = findNearestStation(coords.latitude, coords.longitude);
      setNearestStation(nearest);
      // Auto-save the nearest station if none is saved yet
      if (nearest && !savedStation) {
        setSavedStation(nearest);
        localStorage.setItem('aurora_saved_station', nearest);
      }
    }
  }, [coords, savedStation]);

  const toggleSavedStation = (name: string) => {
    if (savedStation === name) {
      setSavedStation(null);
      localStorage.removeItem('aurora_saved_station');
    } else {
      setSavedStation(name);
      localStorage.setItem('aurora_saved_station', name);
    }
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    const img = event.currentTarget;
    try {
      // 1. Scan specific stations
      const scanned = scanStationStatuses(img);
      setStationStatuses(scanned);

      // 2. Alerts Logic
      const now = Date.now();
      const COOLDOWN = 5 * 60 * 1000;

      if (now - lastToastTimeRef.current > COOLDOWN) {
        let shouldAlert = false;

        if (savedStation) {
          // If user has a favorite, ONLY alert if that specific station is HIGH
          const favorite = scanned.find((s) => s.name === savedStation);
          if (favorite?.status === 'HIGH') {
            shouldAlert = true;
          }
        } else {
          // Default: Check for overall high activity
          const { hasHigh } = checkImageColor(img);
          if (hasHigh) {
            shouldAlert = true;
          }
        }

        if (shouldAlert) {
          toast.error(
            savedStation ? `${savedStation.toUpperCase()}: ${t('map.toast')}` : t('map.toast'),
            {
              position: 'top-right',
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            },
          );
          lastToastTimeRef.current = now;
        }
      }
    } catch (e) {
      console.error('Failed to analyze aurora image colors:', e);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start border-2 border-black dark:border-white p-6 bg-white dark:bg-black shadow-neo dark:shadow-neo-dark">
      {/* Map Column */}
      <div className="relative group border-2 border-black dark:border-white overflow-hidden shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-black min-h-[300px]">
        {isLoading && <Skeleton className="w-full h-full absolute inset-0 z-10" />}

        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-black dark:text-white p-8 text-center bg-neo-yellow border border-black">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={3}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="font-mono font-bold uppercase">{t('map.error')}</p>
          </div>
        ) : (
          <img
            crossOrigin="anonymous"
            src={`${AURORA_DATA}?t=${timestamp}`}
            alt="Aurora Data"
            className={`w-full h-full object-contain transition-all duration-500 bg-gray-200 dark:bg-zinc-800 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleError}
          />
        )}
      </div>

      {/* Info Column */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-display font-bold uppercase text-black dark:text-white">
              {t('map.status_title')}
            </h2>
            {savedStation && (
              <span className="text-xs font-mono font-bold bg-neo-yellow text-black px-2 py-1 border border-black">
                ★ {t('common.saved', 'SAVED')}: {savedStation}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {stationStatuses.map((s) => {
              const isNearest = s.name === nearestStation;
              const isSaved = s.name === savedStation;

              return (
                <div
                  key={s.name}
                  className={`flex items-center gap-2 p-2 border-2 ${isSaved ? 'border-neo-yellow bg-yellow-50 dark:bg-yellow-900/10' : 'border-black dark:border-white bg-gray-50 dark:bg-zinc-900'} relative group transition-all`}
                >
                  <div
                    className="w-3 h-3 border border-black dark:border-white shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-black dark:text-white uppercase truncate">
                        {s.name}
                      </span>
                      {isNearest && (
                        <span className="text-[9px] bg-neo-blue text-white px-1 font-mono font-bold">
                          {t('common.near', 'NEAR')}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      {s.status}
                    </span>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => {
                      toggleSavedStation(s.name);
                    }}
                    className={`ml-auto p-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors ${isSaved ? 'text-neo-yellow' : 'text-gray-300 hover:text-neo-yellow'}`}
                    title={
                      isSaved
                        ? t('common.unsave', 'Unsave Station')
                        : t('common.save', 'Save Station')
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill={isSaved ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                </div>
              );
            })}
            {stationStatuses.length === 0 && !isLoading && (
              <div className="col-span-2 text-center text-xs font-mono text-gray-500 py-4">
                {t('common.no_data', 'NO DATA DETECTED')}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t-2 border-black dark:border-white">
          <p className="text-black dark:text-white leading-relaxed font-mono text-xs mb-4">
            {t('map.description')}
          </p>
          <a
            href={INFO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-neo-mint text-black border-2 border-black px-4 py-2 font-bold font-mono uppercase shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm"
          >
            {t('map.linkText')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={3}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

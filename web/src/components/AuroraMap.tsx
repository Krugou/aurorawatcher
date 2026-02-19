import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { useGeolocation } from '../hooks/useGeolocation';
import { Analytics } from '../utils/analytics';
import {
  checkImageColor,
  findNearestStation,
  scanStationStatuses,
  StationStatus,
} from '../utils/auroraUtils';
import { normalizeStationKey } from '../utils/i18nUtils';
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
      Analytics.trackStationInteraction(savedStation, 'unsave');
    } else {
      setSavedStation(name);
      localStorage.setItem('aurora_saved_station', name);
      Analytics.trackStationInteraction(name, 'save');
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
    <div className="grid md:grid-cols-2 gap-8 items-start rounded-xl bg-white/[0.03] border border-white/10 p-6">
      {/* Map Column */}
      <div className="relative group rounded-xl border border-white/10 overflow-hidden bg-black/40 min-h-[300px] hover:border-white/20 transition-all duration-300">
        {isLoading && <Skeleton className="w-full h-full absolute inset-0 z-10" />}

        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/60 p-8 text-center bg-white/[0.02]">
            <svg
              className="w-12 h-12 mb-2 text-amber-400/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="font-mono font-medium text-white/50">{t('map.error')}</p>
          </div>
        ) : (
          <img
            crossOrigin="anonymous"
            src={`${AURORA_DATA}?t=${timestamp}`}
            alt={t('map.title')}
            className={`w-full h-full object-contain transition-all duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleError}
          />
        )}
      </div>

      {/* Info Column */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-sans font-bold text-white/90">{t('map.status_title')}</h2>
            {savedStation && (
              <span className="text-xs font-mono font-medium bg-aurora-teal/10 text-aurora-teal px-3 py-1 rounded-full border border-aurora-teal/20">
                ★ {t('map.saved')}: {t(`common.loc.${normalizeStationKey(savedStation)}`)}
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
                  className={`flex items-center gap-2 p-2.5 rounded-lg border ${isSaved ? 'border-aurora-teal/30 bg-aurora-teal/5' : 'border-white/10 bg-white/[0.02]'} relative group transition-all duration-300`}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_6px_currentColor]"
                    style={{ backgroundColor: s.color }}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-white/80 truncate">
                        {t(`common.loc.${normalizeStationKey(s.name)}`)}
                      </span>
                      {isNearest && (
                        <span className="text-[9px] bg-aurora-blue/20 text-aurora-blue px-1.5 py-0.5 rounded font-mono font-medium">
                          {t('map.near')}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                      {t(`status.${s.status.toLowerCase()}`)}
                    </span>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => {
                      toggleSavedStation(s.name);
                    }}
                    className={`ml-auto p-1 rounded transition-colors duration-200 ${isSaved ? 'text-aurora-teal' : 'text-white/20 hover:text-aurora-teal'}`}
                    title={isSaved ? t('common.unsave') : t('common.save')}
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
              <div className="col-span-2 text-center text-xs font-mono text-white/30 py-4">
                {t('common.no_data', 'NO DATA DETECTED')}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.06]">
          <p className="text-white/50 leading-relaxed font-mono text-xs mb-4">
            {t('map.description')}
          </p>
          <a
            href={INFO_URL}
            onClick={() => {
              Analytics.trackExternalLink(INFO_URL, 'FMI Service');
            }}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/30 px-4 py-2 font-medium font-mono rounded-lg hover:bg-aurora-teal/20 hover:shadow-[0_0_15px_rgba(0,212,170,0.15)] transition-all duration-300 text-sm"
          >
            {t('map.linkText')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

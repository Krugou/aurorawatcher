import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useImageMetadata } from '../hooks/useImageMetadata';
import { Location } from '../types';
import { Analytics } from '../utils/analytics';
import { Skeleton } from './Skeleton';

interface ObservatoryCardProps {
  id: string;
  loc: Location;
  timestamp: number;
}

export const ObservatoryCard = ({ id, loc, timestamp }: ObservatoryCardProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  // Attempt to fetch timestamp from headers, but use timestamp prop as trigger
  const lastModified = useImageMetadata(loc.image, timestamp);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [timestamp]);

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,212,170,0.08)] transition-all duration-500 group">
      <div className="relative aspect-video bg-black/40 overflow-hidden">
        {isLoading && <Skeleton className="w-full h-full absolute inset-0 z-10" />}

        {hasError ? (
          <div className="w-full h-full flex items-center justify-center text-white/60 bg-white/[0.02]">
            <span className="font-mono text-sm">{t('grid.error')}</span>
          </div>
        ) : (
          <img
            src={`${loc.image}?t=${timestamp}`}
            alt={loc.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
            onLoad={() => {
              setIsLoading(false);
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}

        {/* Status Indicator / LED */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
          <div
            className={`w-2.5 h-2.5 rounded-full ${hasError ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-aurora-teal shadow-[0_0_8px_rgba(0,212,170,0.6)]'} animate-pulse`}
          ></div>
          <span className="bg-black/60 backdrop-blur-sm text-white/80 text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10">
            {hasError ? t('grid.status_offline') : t('grid.status_online')}
          </span>
        </div>

        {!hasError && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white/70 px-2.5 py-1 font-mono text-xs rounded-full border border-white/10">
            {lastModified ? lastModified : t('grid.live')}
          </div>
        )}
      </div>
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-sans font-bold text-white/90">{t(loc.name)}</h3>
          <p className="text-xs font-mono text-white/40 tracking-wide">{t(loc.fullname)}</p>
        </div>
        <div className="flex gap-2">
          {/* History / Fullscreen Button */}
          <a
            href={`?cam=${id}`}
            onClick={() => {
              Analytics.trackStationInteraction(id, 'view_history');
            }}
            className="flex items-center gap-2 px-3 py-2 bg-aurora-teal/10 border border-aurora-teal/30 rounded-lg text-aurora-teal font-medium font-mono text-xs hover:bg-aurora-teal/20 hover:shadow-[0_0_12px_rgba(0,212,170,0.15)] transition-all duration-300"
            title={t('grid.view_fullscreen')}
          >
            <span>{t('grid.view_history')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </a>

          <a
            href={loc.mapUrl}
            onClick={() => {
              Analytics.trackStationInteraction(id, 'view_map');
            }}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white/60 hover:text-white"
            title={t('grid.open_map')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

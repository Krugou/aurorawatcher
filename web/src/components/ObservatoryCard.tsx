import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useImageMetadata } from '../hooks/useImageMetadata';
import { Location } from '../types';
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
    <div className="bg-white dark:bg-black border-2 border-black dark:border-white shadow-neo dark:shadow-neo-dark hover:shadow-neo-lg dark:hover:shadow-neo-dark transition-all duration-200">
      <div className="relative aspect-video bg-gray-200 dark:bg-zinc-900 border-b-2 border-black dark:border-white overflow-hidden">
        {isLoading && <Skeleton className="w-full h-full absolute inset-0 z-10" />}

        {hasError ? (
          <div className="w-full h-full flex items-center justify-center text-black dark:text-white bg-white dark:bg-black">
            <span className="font-mono text-sm uppercase">{t('grid.error')}</span>
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
        <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
          <div
            className={`w-3 h-3 ${hasError ? 'bg-red-500' : 'bg-neo-mint'} border border-black shadow-[0_0_10px_rgba(0,255,157,0.7)] animate-pulse`}
          ></div>
          <span className="bg-black/80 text-white text-[10px] font-mono uppercase px-2 py-0.5 border border-white/50 backdrop-blur-sm">
            {hasError ? t('grid.status_offline') : t('grid.status_online')}
          </span>
        </div>

        {/* Hover overlay removed for cleaner mobile UX - using footer button instead */}

        {!hasError && (
          <div className="absolute top-4 right-4 bg-black text-white px-2 py-1 font-mono text-xs border border-white shadow-neo-sm dark:shadow-none">
            {lastModified ? lastModified : t('grid.live')}
          </div>
        )}
      </div>
      <div className="p-4 flex items-center justify-between bg-white dark:bg-black">
        <div>
          <h3 className="text-xl font-display font-bold uppercase text-black dark:text-white">
            {loc.name}
          </h3>
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {loc.fullname}
          </p>
        </div>
        <div className="flex gap-2">
          {/* History / Fullscreen Button - Always visible for accessibility */}
          <a
            href={`?cam=${id}`}
            className="flex items-center gap-2 px-3 py-2 bg-neo-yellow text-black border-2 border-black font-bold font-mono text-xs uppercase hover:bg-black hover:text-white transition-colors"
            title={t('grid.view_fullscreen')}
          >
            <span>{t('grid.view_history')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </a>

          <a
            href={loc.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-black dark:text-white"
            title={t('grid.open_map')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="square"
                strokeLinejoin="miter"
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

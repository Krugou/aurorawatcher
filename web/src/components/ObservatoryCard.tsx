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
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800 group hover:border-slate-700 transition-all">
      <div className="relative aspect-video bg-black overflow-hidden">
        {isLoading && <Skeleton className="w-full h-full absolute inset-0 z-10" />}

        {hasError ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-900">
            <span className="text-xs">{t('grid.error')}</span>
          </div>
        ) : (
          <img
            src={`${loc.image}?t=${timestamp}`}
            alt={loc.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
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

        {/* Hover overlay for fullscreen */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none md:pointer-events-auto">
          <a
            href={`?cam=${id}`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            {t('grid.view_fullscreen')}
          </a>
        </div>

        {!hasError && (
          <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-md">
            {lastModified ? lastModified : t('grid.live')}
          </div>
        )}
      </div>
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">{loc.name}</h3>
          <p className="text-xs text-slate-400">{loc.fullname}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`?cam=${id}`}
            title={t('grid.view_fullscreen')}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-200 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
            <span className="text-xs font-bold hidden sm:inline">{t('grid.view_fullscreen')}</span>
          </a>
          <a
            href={loc.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Avaa kartalla"
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

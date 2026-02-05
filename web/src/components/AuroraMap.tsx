import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { checkImageColor } from '../utils/auroraUtils';
import { Skeleton } from './Skeleton';

const AURORA_DATA =
  'https://cdn.fmi.fi/weather-observations/products/magnetic-disturbance-observations/map-latest-fi.png';
const INFO_URL = 'https://www.ilmatieteenlaitos.fi/revontulet-ja-avaruussaa';

interface AuroraMapProps {
  timestamp: number;
}

export const AuroraMap = ({ timestamp }: AuroraMapProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const lastToastTimeRef = useRef<number>(0);

  // Reset states when timestamp changes
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [timestamp]);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    const img = event.currentTarget;
    try {
      const { hasHigh } = checkImageColor(img);
      const now = Date.now();
      if (hasHigh && now - lastToastTimeRef.current > 5 * 60 * 1000) {
        toast.error(t('map.toast'), {
          position: 'top-right',
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        lastToastTimeRef.current = now;
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
    <div className="grid md:grid-cols-2 gap-8 items-center border-2 border-black dark:border-white p-6 bg-white dark:bg-black shadow-neo dark:shadow-neo-dark">
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
      <div className="space-y-4">
        <p className="text-black dark:text-white leading-relaxed font-mono text-sm">
          {t('map.description')}
        </p>
        <a
          href={INFO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-neo-mint text-black border-2 border-black px-4 py-2 font-bold font-mono uppercase shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
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
  );
};

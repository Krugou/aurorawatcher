import { useTranslation } from 'react-i18next';

import { Location } from '../types';
import { HistorySlider } from './HistorySlider';

interface FullscreenViewProps {
  loc: Location;
  allLocations: string[];
  historyId?: string;
}

export const FullscreenView = ({ loc, allLocations, historyId }: FullscreenViewProps) => {
  const { t } = useTranslation();
  const currentIndex = allLocations.indexOf(loc.id);
  const prevId = allLocations[(currentIndex - 1 + allLocations.length) % allLocations.length];
  const nextId = allLocations[(currentIndex + 1) % allLocations.length];

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center overflow-hidden z-50">
      {/* Title */}
      <div className="absolute top-4 left-4 right-20 z-40 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md text-white border border-white/10 px-4 py-2 inline-block max-w-full rounded-lg">
          <span className="font-sans font-bold uppercase truncate block text-xl text-white/90">
            {loc.fullname}
          </span>
        </div>
      </div>

      {/* Close Button */}
      <a
        href="?"
        className="absolute top-4 right-4 z-50 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-red-500/80 text-white rounded-full border border-white/20 transition-all duration-300"
        aria-label={t('common.close')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </a>

      <div className="w-full h-full flex flex-col md:flex-row items-center justify-center relative bg-[#0a0a0f]">
        {/* Prev Button */}
        <a
          href={`?cam=${prevId}`}
          className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-40 p-3 md:p-4 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none hidden sm:block"
          title={t('common.prev_cam')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </a>

        {/* Next Button */}
        <a
          href={`?cam=${nextId}`}
          className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-40 p-3 md:p-4 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none hidden sm:block"
          title={t('common.next_cam')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        {/* Content Container */}
        <div className="w-full max-w-7xl px-4 md:px-32">
          <HistorySlider camId={historyId || loc.id} currentImageUrl={loc.image} />
        </div>
      </div>
    </div>
  );
};

import { Location } from '../types';
import { HistorySlider } from './HistorySlider';

interface FullscreenViewProps {
  loc: Location;
  allLocations: string[];
  historyId?: string;
}

export const FullscreenView = ({ loc, allLocations, historyId }: FullscreenViewProps) => {
  const currentIndex = allLocations.indexOf(loc.id);
  const prevId = allLocations[(currentIndex - 1 + allLocations.length) % allLocations.length];
  const nextId = allLocations[(currentIndex + 1) % allLocations.length];

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      {/* Title - Improved for mobile with truncation */}
      <div className="absolute top-4 left-4 right-16 z-40 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 inline-block max-w-full">
          <span className="font-bold text-white text-shadow-sm truncate block">{loc.fullname}</span>
        </div>
      </div>

      {/* Close Button - Larger touch target */}
      <a
        href="?"
        className="absolute top-2 right-2 z-50 p-4 text-white/70 hover:text-white bg-black/20 hover:bg-white/10 backdrop-blur-sm rounded-full transition-all"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
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

      <div className="w-full h-full flex flex-col md:flex-row items-center justify-center relative">
        {/* Prev Button - Adaptive positioning */}
        <a
          href={`?cam=${prevId}`}
          className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-40 p-4 md:p-6 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-all focus:outline-none"
          title="Previous Camera"
        >
          <svg
            className="w-10 h-10 md:w-16 md:h-16 drop-shadow-lg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </a>

        {/* Next Button - Adaptive positioning */}
        <a
          href={`?cam=${nextId}`}
          className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-40 p-4 md:p-6 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-all focus:outline-none"
          title="Next Camera"
        >
          <svg
            className="w-10 h-10 md:w-16 md:h-16 drop-shadow-lg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        {/* Content Container - Responsive padding to avoid arrow overlap */}
        <div className="w-full max-w-7xl px-14 md:px-32">
          <HistorySlider camId={historyId || loc.id} currentImageUrl={loc.image} />
        </div>
      </div>
    </div>
  );
};

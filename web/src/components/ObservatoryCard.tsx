import { useImageMetadata } from '../hooks/useImageMetadata';
import { Location } from '../types';

interface ObservatoryCardProps {
  id: string;
  loc: Location;
  timestamp: number;
}

export const ObservatoryCard = ({ id, loc, timestamp }: ObservatoryCardProps) => {
  // Attempt to fetch timestamp from headers, but use timestamp prop as trigger
  const lastModified = useImageMetadata(loc.image, timestamp);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800 group hover:border-slate-700 transition-all">
      <div className="relative aspect-video bg-black overflow-hidden">
        <img
          src={`${loc.image}?t=${timestamp}`}
          alt={loc.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-md">
          {lastModified ? lastModified : 'LIVE'}
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">{loc.name}</h3>
          <p className="text-xs text-slate-400">{loc.fullname}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`?cam=${id}`}
            title="Fullscreen"
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </a>
          <a
            href={loc.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
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

import { useImageMetadata } from '../hooks/useImageMetadata';
import { Location } from '../types';

interface FullscreenViewProps {
  loc: Location;
  timestamp: number;
}

export const FullscreenView = ({ loc, timestamp }: FullscreenViewProps) => {
  const lastModified = useImageMetadata(loc.image, timestamp);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      <img
        src={`${loc.image}?t=${timestamp}`}
        alt={loc.name}
        className="w-full h-full object-contain"
      />
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded backdrop-blur-sm pointer-events-none">
        <span className="font-bold">{loc.fullname}</span>
        {lastModified && <span className="ml-2 opacity-75">{lastModified}</span>}
      </div>
      <a href="?" className="absolute top-4 right-4 text-white/50 hover:text-white p-2">
        ✕
      </a>
    </div>
  );
};

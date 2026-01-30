import { Location } from '../types';
import { useImageMetadata } from '../hooks/useImageMetadata';

interface MinimalCardProps {
  loc: Location;
  timestamp: number;
}

const MinimalCard = ({ loc, timestamp }: MinimalCardProps) => {
  const lastModified = useImageMetadata(loc.image, timestamp);

  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-lg border border-gray-800 bg-black">
      <img
        src={`${loc.image}?t=${timestamp}`}
        alt={loc.name}
        className="w-full h-auto block"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-sm font-medium flex justify-between">
        <span>{loc.name}</span>
        {lastModified && <span className="opacity-75">{lastModified}</span>}
      </div>
    </div>
  );
};

interface MinimalViewProps {
  locations: Record<string, Location>;
  timestamp: number;
}

export const MinimalView = ({ locations, timestamp }: MinimalViewProps) => {
  return (
    <div className="min-h-screen bg-black text-white p-2 flex flex-col gap-4">
      {Object.entries(locations).map(([key, loc]) => (
        <MinimalCard key={key} loc={loc} timestamp={timestamp} />
      ))}
    </div>
  );
};

import { useTranslation } from 'react-i18next';

import { useImageMetadata } from '../hooks/useImageMetadata';
import { Location } from '../types';
import { Analytics } from '../utils/analytics';

interface MinimalCardProps {
  loc: Location;
  timestamp: number;
}

const MinimalCard = ({ loc, timestamp }: MinimalCardProps) => {
  const { t } = useTranslation();
  const lastModified = useImageMetadata(loc.image, timestamp);

  return (
    <div className="relative w-full rounded-xl border border-white/10 overflow-hidden group mb-2">
      <img
        src={`${loc.image}?t=${timestamp}`}
        alt={loc.name}
        className="w-full h-auto block grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
        loading="lazy"
      />
      <div className="absolute top-2 left-2 flex gap-2">
        <span className="bg-aurora-teal/80 text-black font-mono font-bold text-xs px-2 py-0.5 rounded-md uppercase">
          {t(loc.name)}
        </span>
        {lastModified && (
          <span className="bg-black/60 backdrop-blur-sm text-white/80 font-mono text-xs px-2 py-0.5 rounded-md border border-white/10">
            {lastModified}
          </span>
        )}
      </div>
    </div>
  );
};

interface MinimalViewProps {
  locations: Record<string, Location>;
  timestamp: number;
}

export const MinimalView = ({ locations, timestamp }: MinimalViewProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 flex flex-col gap-4">
      <a
        href="/"
        onClick={() => {
          Analytics.trackNavigation('back_from_minimal');
        }}
        className="fixed bottom-4 right-4 z-50 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full font-mono text-xs uppercase hover:bg-white/20 transition-all duration-300"
      >
        {t('minimal.back')}
      </a>
      {Object.entries(locations).map(([key, loc]) => (
        <MinimalCard key={key} loc={loc} timestamp={timestamp} />
      ))}
    </div>
  );
};

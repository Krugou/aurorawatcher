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
    <div className="relative w-full border-2 border-white bg-black group mb-2">
      <img
        src={`${loc.image}?t=${timestamp}`}
        alt={loc.name}
        className="w-full h-auto block grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100"
        loading="lazy"
      />
      <div className="absolute top-2 left-2 flex gap-2">
        <span className="bg-neo-mint text-black font-mono font-bold text-xs px-2 py-0.5 border border-white uppercase">
          {t(loc.name)}
        </span>
        {lastModified && (
          <span className="bg-black text-white border border-white font-mono text-xs px-2 py-0.5 opacity-75">
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
    <div className="min-h-screen bg-black text-white p-4 flex flex-col gap-4">
      <a
        href="/"
        onClick={() => {
          Analytics.trackNavigation('back_from_minimal');
        }}
        className="fixed bottom-4 right-4 z-50 bg-black/50 backdrop-blur-sm border border-white/30 text-white px-4 py-2 font-mono text-xs uppercase hover:bg-white hover:text-black transition-colors"
      >
        {t('minimal.back')}
      </a>
      {Object.entries(locations).map(([key, loc]) => (
        <MinimalCard key={key} loc={loc} timestamp={timestamp} />
      ))}
    </div>
  );
};

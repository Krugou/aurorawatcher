import { useTranslation } from 'react-i18next';

import { Skeleton } from './Skeleton';

const WEBCAMS = [
  {
    id: 'sodankyla',
    name: 'Sodankylä (FI)',
    url: 'https://www.sgo.fi/Data/RealTime/Kuvat/UusiTaivas/latest-small.jpg',
    refresh: true,
  },
  {
    id: 'abisko',
    name: 'Abisko (SE)',
    url: 'https://auroraskystation.se/live/latest.jpg',
    refresh: true,
  },
  {
    id: 'skibotn',
    name: 'Skibotn (NO)',
    url: 'https://fox.phys.uit.no/cams/skibotn/last_snap.jpg',
    refresh: true,
  },
  // Adding more reliable static image sources is safer than iframes for this demo
  // In a real app, I'd proxy these to avoid CORS or mixed content issues
];

export const WebcamGrid = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {WEBCAMS.map((cam) => (
        <div
          key={cam.id}
          className="relative group border-2 border-black dark:border-white shadow-neo-sm bg-black overflow-hidden aspect-video"
        >
          {!cam.url && <Skeleton className="w-full h-full" />}
          <img
            src={`${cam.url}${cam.refresh ? `?t=${Date.now()}` : ''}`}
            alt={cam.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
            onError={(e) => {
              // Fallback on error
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add(
                'bg-gray-800',
                'flex',
                'items-center',
                'justify-center',
              );
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerText = t('grid.error');
              }
            }}
          />
          <div className="absolute bottom-0 left-0 bg-black/70 px-2 py-1">
            <span className="text-neo-green font-mono text-xs font-bold uppercase">{cam.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

import { useTranslation } from 'react-i18next';

import { Skeleton } from './Skeleton';

const PROXY_URL = 'https://proxy.aleksi-nokelainen.workers.dev/?url=';

const getProxiedUrl = (url: string) => `${PROXY_URL}${encodeURIComponent(url)}`;

const WEBCAMS = [
  {
    id: 'sodankyla-fi',
    name: 'Sodankylä (FI)',
    // Verified: SGO's Sky-I network latest image.
    url: 'https://www.sgo.fi/Data/RealTime/Kuvat/SOD.jpg',
    refresh: true,
  },
  {
    id: 'skibotn-no',
    name: 'Skibotn (NO)',
    // Verified: Part of the TGO network.
    url: 'https://www.tgo.uit.no/allsky/1/ASC01.png',
    refresh: true,
  },
  {
    id: 'poker-flat-ak',
    name: 'Poker Flat (US)',
    // Verified: Managed by the UAF Geophysical Institute.
    url: 'https://optics.gi.alaska.edu/allsky/pkr/latest_small.jpg',
    refresh: true,
  },
  {
    id: 'kiruna-se',
    name: 'Kiruna (SE)',
    // Verified: Swedish Institute of Space Physics (IRF) real-time 3D magnetic field plot.
    url: 'https://www2.irf.se/maggraphs/3dplot.png',
    refresh: true,
  },
];

export const WebcamGrid = () => {
  const { t } = useTranslation();

  WEBCAMS.forEach((cam) => {
    fetch(getProxiedUrl(cam.url), { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          console.log(`${cam.name} is UP`);
        } else {
          console.warn(`${cam.name} returned status ${res.status}`);
        }
      })
      .catch(() => {
        console.error(`${cam.name} is BLOCKED/DOWN`);
      });
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {WEBCAMS.map((cam) => (
        <div
          key={cam.id}
          className="relative group rounded-xl border border-white/10 bg-black/40 overflow-hidden aspect-video hover:border-white/20 transition-all duration-300"
        >
          {!cam.url && <Skeleton className="w-full h-full" />}
          <img
            src={`${getProxiedUrl(cam.url)}${cam.refresh ? `&t=${Date.now()}` : ''}`}
            alt={cam.name}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
            onError={(e) => {
              // Fallback on error
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add(
                'bg-white/[0.02]',
                'flex',
                'items-center',
                'justify-center',
              );
              if (e.currentTarget.parentElement) {
                const errorText = document.createElement('span');
                errorText.className = 'text-white/40 text-xs font-mono p-4 text-center';
                errorText.innerText = t('grid.error');
                e.currentTarget.parentElement.appendChild(errorText);
              }
            }}
          />
          <div className="absolute bottom-0 left-0 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-tr-lg">
            <span className="text-aurora-teal/80 font-mono text-xs font-medium">{cam.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

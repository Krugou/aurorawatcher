const AURORA_DATA =
  'https://cdn.fmi.fi/weather-observations/products/magnetic-disturbance-observations/map-latest-fi.png';
const INFO_URL = 'https://www.ilmatieteenlaitos.fi/revontulet-ja-avaruussaa';

interface AuroraMapProps {
  timestamp: number;
}

import { useRef } from 'react';
import { toast } from 'react-toastify';
import { checkImageColor } from '../utils/auroraUtils';

export const AuroraMap = ({ timestamp }: AuroraMapProps) => {
  const lastToastTimeRef = useRef<number>(0);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    try {
      const { hasHigh } = checkImageColor(img);
      const now = Date.now();
      // Prevent spamming toasts - wait at least 1 hour between alerts for the same session if needed
      // But for this request, we just "toast we can see red"
      // Let's debounce it slightly so we don't spam if component re-renders quickly,
      // but the requirement implies we want to see it when detected.
      // A simple 5-minute debounce seems reasonable to avoid duplicate toasts on immediate re-fetches.
      if (hasHigh && now - lastToastTimeRef.current > 5 * 60 * 1000) {
        toast.error('Korkea revontuliaktiivisuus havaittu! (Punainen alue)', {
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

  return (
    <section className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800/50">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <span className="w-2 h-8 bg-green-500 rounded-full"></span>
        Magneettiset Häiriöt
      </h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative group rounded-xl overflow-hidden shadow-2xl bg-black">
          <img
            crossOrigin="anonymous"
            src={`${AURORA_DATA}?t=${timestamp}`}
            alt="Aurora Data"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            onLoad={handleImageLoad}
          />
        </div>
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Kartta näyttää magneettikentän hetkelliset häiriöt Suomen alueella. Mitä punaisempi
            väri, sitä suurempi todennäköisyys revontulille.
          </p>
          <a
            href={INFO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            Avaa FMI:n palvelu
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

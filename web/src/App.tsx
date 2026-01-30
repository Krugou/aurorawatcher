import { useEffect,useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuroraMap } from './components/AuroraMap';
import { FullscreenView } from './components/FullscreenView';
import { Header } from './components/Header';
import { MinimalView } from './components/MinimalView';
import { ObservatoryGrid } from './components/ObservatoryGrid';
import { Location } from './types';

// Konfiguraatio ja tila
const LOCATIONS: Record<string, Location> = {
  muonio: {
    id: 'muonio',
    name: 'Muonio',
    fullname: 'Muonio, Suomi',
    mapUrl: 'https://maps.app.goo.gl/rmr9YMBuR66GCB2X8',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_MUO.jpg',
  },
  nyrola: {
    id: 'nyrola',
    name: 'Nyrölä',
    fullname: 'Nyrölän Observatorio, Suomi',
    mapUrl: 'https://maps.app.goo.gl/m9AHq8wxAhJyBVUMA',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR.jpg',
  },
  hankasalmi: {
    id: 'hankasalmi',
    name: 'Hankasalmi',
    fullname: 'Hankasalmen observatorio',
    mapUrl: 'https://maps.app.goo.gl/sDCpGgSkcMKgDojh6',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR_AllSky.jpg',
  },
  metsahovi: {
    id: 'metsahovi',
    name: 'Metsähovi',
    fullname: 'Metsähovin radio-observatorio',
    mapUrl: 'https://maps.app.goo.gl/BG3JC7uHLLcdi5C1A',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_HOV.jpg',
  },
};

const App = () => {
  const [timestamp, setTimestamp] = useState(Date.now());
  const [mode, setMode] = useState<'default' | 'minimal' | 'fullscreen'>('default');
  const [activeCam, setActiveCam] = useState<string | null>(null);

  // Tarkista URL-parametrit
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'minimal') {
      setMode('minimal');
    }
    const cam = params.get('cam');
    if (cam && Object.keys(LOCATIONS).includes(cam)) {
      setActiveCam(cam);
      setMode('fullscreen');
    }

    // Päivitä kuvat 5 minuutin välein (300000 ms)
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // Mobiili/Kioski -näkymät
  if (mode === 'fullscreen' && activeCam) {
    const loc = LOCATIONS[activeCam];
    return <FullscreenView loc={loc} timestamp={timestamp} />;
  }

  if (mode === 'minimal') {
    return <MinimalView locations={LOCATIONS} timestamp={timestamp} />;
  }

  // Oletusnäkymä (Työpöytä/Mobiili)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center">
      <div className="w-full max-w-5xl p-4 space-y-8">
        <Header />

        <AuroraMap timestamp={timestamp} />

        <ObservatoryGrid locations={LOCATIONS} timestamp={timestamp} />

        <footer className="text-center py-12 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Revontulivahti. Kuvat: FMI & Observatoriot.</p>
        </footer>
      </div>
      <ToastContainer position="top-right" theme="dark" aria-label="Ilmoitukset" />
    </div>
  );
};

export default App;

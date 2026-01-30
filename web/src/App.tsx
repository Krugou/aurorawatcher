import 'react-toastify/dist/ReactToastify.css';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';

import { AuroraMap } from './components/AuroraMap';
import { FullscreenView } from './components/FullscreenView';
import { Header } from './components/Header';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { MinimalView } from './components/MinimalView';
import { ObservatoryGrid } from './components/ObservatoryGrid';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import { LocalData } from './components/LocalData';
import { SpaceWeather } from './components/SpaceWeather';
import { MagnetometerGraph } from './components/MagnetometerGraph';
import { SolarWindGraph } from './components/SolarWindGraph';
import { CameraGrid } from './components/CameraGrid';
import { DataInfo } from './components/DataInfo';
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

const AppContent = () => {
  const { t } = useTranslation();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center transition-colors duration-300">
      <LanguageSwitcher />
      <ThemeToggle />
      <div className="w-full max-w-6xl p-4 md:p-8 space-y-12 md:space-y-16">
        <Header />

        <LocalData />
        <SpaceWeather />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MagnetometerGraph />
            <SolarWindGraph />
        </div>

        <CameraGrid />

        <AuroraMap timestamp={timestamp} />

        <DataInfo />

        <ObservatoryGrid locations={LOCATIONS} timestamp={timestamp} />

        <footer className="text-center py-12 text-slate-500 text-sm">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </footer>
      </div>
      <ToastContainer position="top-right" theme="dark" aria-label="Ilmoitukset" />
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

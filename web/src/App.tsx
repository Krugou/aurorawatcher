import 'react-toastify/dist/ReactToastify.css';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';

import { AuroraMap } from './components/AuroraMap';
import { CollapsibleSection } from './components/CollapsibleSection';
import { DataInfo } from './components/DataInfo';
import { FullscreenView } from './components/FullscreenView';
import { Header } from './components/Header';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { LocalData } from './components/LocalData';
import { MagnetometerGraph } from './components/MagnetometerGraph';
import { MinimalView } from './components/MinimalView';
import { ObservatoryGrid } from './components/ObservatoryGrid';
import { SightingButton } from './components/SightingButton';
import { SightingsFeed } from './components/SightingsFeed';
import { SolarWindGraph } from './components/SolarWindGraph';
import { SpaceWeather } from './components/SpaceWeather';
import { ThemeToggle } from './components/ThemeToggle';
import { WebcamGrid } from './components/WebcamGrid';
import { ThemeProvider } from './context/ThemeProvider';
import { useAuroraAlert } from './hooks/useAuroraAlert';
import { useTitleFlasher } from './hooks/useTitleFlasher';
import { Location } from './types';

// Konfiguraatio ja tila
const LOCATIONS: Record<string, Location> = {
  muonio: {
    id: 'muonio',
    name: 'common.loc.muonio',
    fullname: 'common.loc.muonio_full',
    mapUrl: 'https://maps.app.goo.gl/rmr9YMBuR66GCB2X8',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_MUO.jpg',
  },
  nyrola: {
    id: 'nyrola',
    name: 'common.loc.nyrola',
    fullname: 'common.loc.nyrola_full',
    mapUrl: 'https://maps.app.goo.gl/m9AHq8wxAhJyBVUMA',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR.jpg',
  },
  hankasalmi: {
    id: 'hankasalmi',
    name: 'common.loc.hankasalmi',
    fullname: 'common.loc.hankasalmi_full',
    mapUrl: 'https://maps.app.goo.gl/sDCpGgSkcMKgDojh6',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR_AllSky.jpg',
  },
  metsahovi: {
    id: 'metsahovi',
    name: 'common.loc.metsahovi',
    fullname: 'common.loc.metsahovi_full',
    mapUrl: 'https://maps.app.goo.gl/BG3JC7uHLLcdi5C1A',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_HOV.jpg',
  },
};

const AppContent = () => {
  const { t } = useTranslation();
  const [timestamp, setTimestamp] = useState(Date.now());
  const [mode, setMode] = useState<'default' | 'minimal' | 'fullscreen'>('default');
  const [activeCam, setActiveCam] = useState<string | null>(null);

  // Aurora Alert Logic
  const isHighActivity = useAuroraAlert();
  useTitleFlasher(isHighActivity, [t('common.alert_title')]);

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
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Mobiili/Kioski -näkymät
  if (mode === 'fullscreen' && activeCam) {
    const loc = LOCATIONS[activeCam];

    return (
      <FullscreenView
        loc={{ ...loc, name: t(loc.name), fullname: t(loc.fullname) }}
        historyId={activeCam}
        allLocations={Object.keys(LOCATIONS)}
      />
    );
  }

  if (mode === 'minimal') {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <MinimalView locations={LOCATIONS} timestamp={timestamp} />
      </div>
    );
  }

  // Oletusnäkymä (Työpöytä/Mobiili)
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white/90 font-sans flex flex-col items-center transition-colors duration-500">
      {/* Ambient aurora background effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-aurora-teal/[0.03] rounded-full blur-[150px] animate-aurora-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-aurora-violet/[0.03] rounded-full blur-[150px] animate-aurora-pulse"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      {/* Sightings Ticker */}
      <SightingsFeed />

      {/* Top Controls Container */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-6xl p-4 md:p-8 space-y-10 md:space-y-14 relative z-10">
        <Header />

        <CollapsibleSection
          title={t('local.title')}
          headerColorClass="bg-aurora-rose"
          storageKey="local_data"
        >
          <LocalData />

          {/* Social Reporting */}
          <div className="flex justify-center mt-8 mb-4">
            <SightingButton />
          </div>
        </CollapsibleSection>
        <CollapsibleSection
          title={t('grid.title')}
          headerColorClass="bg-aurora-blue"
          storageKey="observatory_status"
        >
          <ObservatoryGrid locations={LOCATIONS} timestamp={timestamp} />

          {/* International Webcams */}
          <div className="mt-8 pt-8 border-t border-white/[0.06]">
            <h3 className="text-lg font-sans font-bold uppercase mb-4 text-white/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-aurora-teal shadow-[0_0_8px_rgba(0,212,170,0.5)] animate-pulse" />
              {t('webcams.title')}
            </h3>
            <WebcamGrid />
          </div>
        </CollapsibleSection>
        <CollapsibleSection
          title={t('space_weather.title')}
          headerColorClass="bg-aurora-violet"
          storageKey="space_weather"
          badge={
            <span className="text-xs font-medium font-mono text-white/60 bg-white/[0.06] px-3 py-1 rounded-full border border-white/10">
              {t('common.noaa_swpc', 'NOAA SWPC')}
            </span>
          }
        >
          <SpaceWeather />
        </CollapsibleSection>

        <CollapsibleSection
          title={t('graphs.title')}
          headerColorClass="bg-aurora-cyan"
          storageKey="graphs"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MagnetometerGraph />
            <SolarWindGraph />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title={t('map.title')}
          headerColorClass="bg-aurora-teal"
          storageKey="map"
        >
          <AuroraMap timestamp={timestamp} />
        </CollapsibleSection>

        <CollapsibleSection
          title={t('data_info.title')}
          headerColorClass="bg-white/40"
          storageKey="data_info"
        >
          <DataInfo />
        </CollapsibleSection>

        <footer className="text-center py-12 text-white/30 font-mono text-xs uppercase tracking-widest">
          <p title={`${t('common.build_time')}: ${__BUILD_TIME__}`}>
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </footer>
      </div>
      <ToastContainer position="top-right" theme="dark" aria-label={t('common.notifications')} />
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

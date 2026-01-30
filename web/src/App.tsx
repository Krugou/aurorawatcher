import { useState, useEffect } from "react";

// Konfiguraatio ja käännökset
const LOCATIONS = {
  muonio: {
    id: 'muonio',
    name: 'Muonio',
    fullname: 'Muonio, Suomi',
    mapUrl: 'https://maps.app.goo.gl/rmr9YMBuR66GCB2X8',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_MUO.jpg'
  },
  nyrola: {
    id: 'nyrola',
    name: 'Nyrölä',
    fullname: 'Nyrölän Observatorio, Suomi',
    mapUrl: 'https://maps.app.goo.gl/m9AHq8wxAhJyBVUMA',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR.jpg'
  },
  hankasalmi: {
    id: 'hankasalmi',
    name: 'Hankasalmi',
    fullname: 'Hankasalmen observatorio',
    mapUrl: 'https://maps.app.goo.gl/sDCpGgSkcMKgDojh6',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR_AllSky.jpg'
  },
  metsahovi: {
    id: 'metsahovi',
    name: 'Metsähovi',
    fullname: 'Metsähovin radio-observatorio',
    mapUrl: 'https://maps.app.goo.gl/BG3JC7uHLLcdi5C1A',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_HOV.jpg'
  },
};

const AURORA_DATA = 'https://cdn.fmi.fi/weather-observations/products/magnetic-disturbance-observations/map-latest-fi.png';
const INFO_URL = 'https://www.ilmatieteenlaitos.fi/revontulet-ja-avaruussaa';

function App() {
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

    // Päivitä kuvat minuutin välein
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Minimal / Fullscreen näkymä (Mobiilioptimoitu)
  if (mode === 'fullscreen' && activeCam) {
      // @ts-ignore
    const loc = LOCATIONS[activeCam as keyof typeof LOCATIONS];
    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
            <img
                src={`${loc.image}?t=${timestamp}`}
                alt={loc.name}
                className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded backdrop-blur-sm">
                {loc.fullname}
            </div>
        </div>
    )
  }

  if (mode === 'minimal') {
    return (
      <div className="min-h-screen bg-black text-white p-2 flex flex-col gap-4">
        {Object.entries(LOCATIONS).map(([key, loc]) => (
           <div key={key} className="relative w-full rounded-lg overflow-hidden shadow-lg border border-gray-800">
             <img
               src={`${loc.image}?t=${timestamp}`}
               alt={loc.name}
               className="w-full h-auto block"
               loading="lazy"
             />
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-sm font-medium">
               {loc.name}
             </div>
           </div>
        ))}
      </div>
    );
  }

  // Oletusnäkymä (Työpöytä/Perusmobiili)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Revontulivahti
          </h1>
          <p className="text-slate-400 text-lg">Reaaliaikainen revontuliseuranta Suomessa</p>
        </header>

        {/* Aurora Map Section */}
        <section className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800/50">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-green-500 rounded-full"></span>
            Magneettiset Häiriöt
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative group rounded-xl overflow-hidden shadow-2xl bg-black">
                <img
                    src={`${AURORA_DATA}?t=${timestamp}`}
                    alt="Aurora Data"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                    Kartta näyttää magneettikentän hetkelliset häiriöt Suomen alueella.
                    Mitä punaisempi väri, sitä suurempi todennäköisyys revontulille.
                </p>
                <a
                    href={INFO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors"
                >
                    Avaa FMI:n palvelu
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>
          </div>
        </section>

        {/* Webcam Grid */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 px-2">
            <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
            Observatoriokamerat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {Object.entries(LOCATIONS).map(([key, loc]) => (
              <div key={key} className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800 group hover:border-slate-700 transition-all">
                <div className="relative aspect-video bg-black overflow-hidden">
                   <img
                     src={`${loc.image}?t=${timestamp}`}
                     alt={loc.name}
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                     loading="lazy"
                   />
                   <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white backdrop-blur-md">
                        LIVE
                   </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">{loc.name}</h3>
                    <p className="text-xs text-slate-400">{loc.fullname}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                        href={`?cam=${key}`}
                        title="Fullscreen"
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    </a>
                    <a
                        href={loc.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                        title="Avaa kartalla"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center py-12 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Revontulivahti. Kuvat: FMI & Observatoriot.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

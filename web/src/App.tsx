import { useState, useEffect } from "react";
import "./App.css";

// Reusing constants from the bot config manually to ensure separation
const LOCATIONS = {
  muonio: {
    name: 'Muonio, Finland',
    mapUrl: 'https://maps.app.goo.gl/rmr9YMBuR66GCB2X8',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_MUO.jpg'
  },
  nyrola: {
    name: 'Nyrölä Observatory, Finland',
    mapUrl: 'https://maps.app.goo.gl/m9AHq8wxAhJyBVUMA',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR.jpg'
  },
  hankasalmi: {
    name: 'Hankasalmi observatory',
    mapUrl: 'https://maps.app.goo.gl/sDCpGgSkcMKgDojh6',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR_AllSky.jpg'
  },
  metsahovi: {
    name: 'Metsähovi Radio Observatory',
    mapUrl: 'https://maps.app.goo.gl/BG3JC7uHLLcdi5C1A',
    image: 'https://space.fmi.fi/MIRACLE/RWC/latest_HOV.jpg'
  },
};

const AURORA_DATA = 'https://cdn.fmi.fi/weather-observations/products/magnetic-disturbance-observations/map-latest-fi.png';
const INFO_URL = 'https://www.ilmatieteenlaitos.fi/revontulet-ja-avaruussaa';

function App() {
  const [timestamp, setTimestamp] = useState(Date.now());

  // Refresh images every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Aurora Watcher</h1>
        <p>Real-time aurora borealis montoring in Finland</p>
      </header>

      <section className="aurora-map">
        <h2>Magnetic Disturbance Map</h2>
        <div className="image-card main-card">
          <img src={`${AURORA_DATA}?t=${timestamp}`} alt="Aurora Data" />
          <div className="card-info">
             <a href={INFO_URL} target="_blank" rel="noreferrer">View FMI Data Source</a>
          </div>
        </div>
      </section>

      <section className="observatories">
        <h2>Observatory Cams</h2>
        <div className="grid">
          {Object.entries(LOCATIONS).map(([key, loc]) => (
            <div key={key} className="image-card">
              <h3>{loc.name}</h3>
              <div className="image-wrapper">
                 <img src={`${loc.image}?t=${timestamp}`} alt={loc.name} loading="lazy" />
              </div>
              <div className="card-info">
                <a href={loc.mapUrl} target="_blank" rel="noreferrer">Open in Maps</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <p>Images courtesy of FMI & Observatories. Bot & Site by AuroraWatcher.</p>
      </footer>
    </div>
  );
}

export default App;

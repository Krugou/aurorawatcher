import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const WEBCAMS = [
  {
    id: 'sodankyla-fi',
    name: 'Sodankylä (FI)',
    url: 'https://www.sgo.fi/Data/RealTime/Kuvat/SOD.jpg',
  },
  {
    id: 'skibotn-no',
    name: 'Skibotn (NO)',
    url: 'https://fox.phys.uit.no/ASC/Latest_ASC01.png',
  },
  {
    id: 'poker-flat-ak',
    name: 'Poker Flat (US)',
    liveEndpoint: 'https://allsky.gi.alaska.edu/src/checkLive.php?cam=poker-flat',
    baseUrl: 'https://allsky.gi.alaska.edu/',
  },
  {
    id: 'kiruna-se',
    name: 'Kiruna (SE)',
    url: 'https://www2.irf.se/maggraphs/3dplot.png',
  },
];

type Webcam = (typeof WEBCAMS)[number];

const WebcamCard = ({ cam }: { cam: Webcam }) => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [unavailable, setUnavailable] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('url' in cam ? cam.url : null);

  const refreshFeed = useCallback(async () => {
    if ('liveEndpoint' in cam && cam.liveEndpoint && 'baseUrl' in cam && cam.baseUrl) {
      try {
        const response = await fetch(cam.liveEndpoint);
        if (!response.ok) throw new Error(`Camera status ${response.status}`);
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Camera stream is unavailable');
        const { value } = await reader.read();
        await reader.cancel();
        const eventStream = String.fromCharCode(...(value ?? []));
        const imagePath = eventStream.match(/data:\s*"0":\s*"([^"]+)"/)?.[1];
        if (!imagePath) throw new Error('No current camera image');
        setSourceUrl(new URL(imagePath, cam.baseUrl).href);
        setRefreshKey(Date.now());
        setUnavailable(false);
      } catch {
        setUnavailable(true);
      }
      return;
    }

    setRefreshKey(Date.now());
    setUnavailable(false);
  }, [cam]);

  useEffect(() => {
    void refreshFeed();
    const interval = setInterval(() => void refreshFeed(), 60000);
    return () => clearInterval(interval);
  }, [refreshFeed]);

  return (
    <article className="relative group rounded-xl border border-white/10 bg-black/40 overflow-hidden aspect-video hover:border-white/20 transition-all duration-300">
      {!unavailable && sourceUrl ? (
        <img
          key={refreshKey}
          src={`${sourceUrl}${sourceUrl.includes('?') ? '&' : '?'}t=${refreshKey}`}
          alt={cam.name}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
          loading="lazy"
          onError={() => setUnavailable(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/[0.02] px-4 text-center">
          <span className="text-sm font-medium text-white/75">{t('webcams.unavailable')}</span>
          <button
            type="button"
            onClick={() => void refreshFeed()}
            className="rounded-lg border border-white/15 px-3 py-1.5 font-mono text-xs text-aurora-teal hover:border-aurora-teal/40"
          >
            {t('webcams.retry')}
          </button>
        </div>
      )}
      <div className="absolute bottom-0 left-0 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-tr-lg">
        <span className="text-aurora-teal/90 font-mono text-xs font-medium">{cam.name}</span>
      </div>
    </article>
  );
};

export const WebcamGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {WEBCAMS.map((cam) => (
      <WebcamCard key={cam.id} cam={cam} />
    ))}
  </div>
);

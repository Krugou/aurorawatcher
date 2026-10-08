import { formatDistanceToNow } from 'date-fns';
import {
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { app } from '../firebase';

interface Sighting {
  id: string;
  timestamp: Timestamp;
  location?: { lat: number; lng: number };
}

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

export const SightingsFeed = () => {
  const { t } = useTranslation();
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const db = getFirestore(app);
    const q = query(collection(db, 'sightings'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setSightings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Sighting[]);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="font-mono text-xs animate-pulse text-aurora-teal/60 px-4">
        {t('social.scanning')}
      </div>
    );

  const newestTimestamp = sightings[0]?.timestamp?.toDate().getTime();
  const isStale = newestTimestamp !== undefined && now - newestTimestamp > STALE_AFTER_MS;

  return (
    <div className="w-full bg-black/40 backdrop-blur-sm border-y border-aurora-teal/10 py-2">
      {isStale && (
        <p className="px-4 pb-1 text-center font-mono text-[10px] uppercase tracking-widest text-amber-300/80">
          {t('social.stale')}
        </p>
      )}
      {sightings.length === 0 ? (
        <p className="px-4 text-center font-mono text-xs text-white/45">{t('social.noRecent')}</p>
      ) : (
        <div className="overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex gap-8">
            {sightings.map((sighting) => {
              const date = sighting.timestamp?.toDate();
              return (
                <span
                  key={sighting.id}
                  className="text-aurora-teal/70 font-mono text-xs font-medium"
                >
                  📡 {t('social.reported')} · {date ? date.toLocaleString() : t('social.just_now')}{' '}
                  · {date ? formatDistanceToNow(date, { addSuffix: true }) : t('social.just_now')}
                  {sighting.location
                    ? ` :: LOC (${sighting.location.lat.toFixed(1)}, ${sighting.location.lng.toFixed(1)})`
                    : ''}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

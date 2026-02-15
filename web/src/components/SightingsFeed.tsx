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

export const SightingsFeed = () => {
  const { t } = useTranslation();
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore(app);
    // Query last 10 sightings, newest first
    const q = query(collection(db, 'sightings'), orderBy('timestamp', 'desc'), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newSightings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sighting[];
      setSightings(newSightings);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading)
    return (
      <div className="font-mono text-xs animate-pulse text-neo-green px-4">
        {t('social.scanning')}
      </div>
    );

  if (sightings.length === 0) return null;

  return (
    <div className="w-full bg-black border-y-2 border-neo-green overflow-hidden py-1">
      <div className="animate-marquee whitespace-nowrap flex gap-8">
        {sightings.map((s) => (
          <span key={s.id} className="text-neo-green font-mono text-sm font-bold uppercase">
            📡 {t('social.reported')}{' '}
            {s.timestamp
              ? formatDistanceToNow(s.timestamp.toDate(), { addSuffix: true })
              : t('social.just_now')}
            {s.location
              ? ` :: LOC (${s.location.lat.toFixed(1)}, ${s.location.lng.toFixed(1)})`
              : ''}
          </span>
        ))}
        {/* Duplicate for smooth loop if needed, or CSS handle it */}
      </div>
    </div>
  );
};

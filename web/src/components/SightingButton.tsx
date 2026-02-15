import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { app } from '../firebase';
import { useGeolocation } from '../hooks/useGeolocation';

export const SightingButton = () => {
  const { t } = useTranslation();
  const { coords } = useGeolocation();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSighting = async () => {
    if (loading || cooldown) return;

    setLoading(true);

    // Helper to submit data
    const submitSighting = async (lat?: number, lng?: number) => {
      try {
        const db = getFirestore(app);
        await addDoc(collection(db, 'sightings'), {
          timestamp: serverTimestamp(),
          location: lat && lng ? { lat, lng } : null,
          userAgent: navigator.userAgent,
        });

        setShowConfetti(true);
        setCooldown(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
        setTimeout(
          () => {
            setCooldown(false);
          },
          10 * 60 * 1000,
        ); // 10 min cooldown
      } catch (error) {
        console.error('Error reporting sighting:', error);
        alert('Failed to report sighting. Check console.');
      } finally {
        setLoading(false);
      }
    };

    // If we already have coords, use them
    if (coords) {
      await submitSighting(coords.latitude, coords.longitude);
      return;
    }

    // Otherwise, ask for them active
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!navigator.geolocation) {
      void submitSighting();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void submitSighting(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn('Location denied or failed:', err);
        // Submit without location if they deny
        void submitSighting();
      },
      { timeout: 10000 },
    );
  };

  return (
    <div className="flex flex-col items-center gap-2 relative">
      <button
        onClick={() => {
          void handleSighting();
        }}
        disabled={loading || cooldown}
        className={`
          relative px-8 py-4 font-black font-display text-xl uppercase tracking-widest
          border-4 border-black dark:border-white shadow-neo dark:shadow-neo-dark
          transition-all duration-100 transform active:scale-95
          ${
            cooldown
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-neo-pink text-black hover:-translate-y-1 hover:shadow-neo-lg'
          }
        `}
      >
        {loading ? 'SENDING...' : cooldown ? 'COOLDOWN ⏱️' : 'I SEE IT! 👀'}

        {/* Confetti / Pulse Effect */}
        {showConfetti && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-neo-pink opacity-75"></span>
          </span>
        )}
      </button>

      {cooldown && (
        <p className="text-xs font-mono text-gray-500 animate-pulse">{t('social.thanks')}</p>
      )}
    </div>
  );
};

import { useEffect, useState } from 'react';

import { fetchSolarData } from '../services/solarService';

export const useAuroraAlert = () => {
  const [isHighActivity, setIsHighActivity] = useState(false);

  useEffect(() => {
    const checkActivity = async () => {
      try {
        const data = await fetchSolarData();
        if (data) {
          // Alert conditions:
          // Kp >= 5 (Storm)
          // Bz <= -10 (Strong southward IMF)
          // Speed > 600 (Fast wind) - Optional, maybe too noisy

          const highKp = data.kp >= 5;
          const lowBz = data.bz <= -5; // Lowered threshold slightly to be more responsive to "red" conditions

          setIsHighActivity(highKp || lowBz);
        }
      } catch (e) {
        console.error('Failed to check aurora activity for alert', e);
      }
    };

    checkActivity();
    const interval = setInterval(checkActivity, 60000 * 5); // Check every 5 mins
    return () => clearInterval(interval);
  }, []);

  return isHighActivity;
};

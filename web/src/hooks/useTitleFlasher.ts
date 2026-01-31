import { useEffect, useRef } from 'react';

export const useTitleFlasher = (isActive: boolean, messages: string[] = ['🔴 AURORA ALERT!', '🔴 REVONTULIA!']) => {
  const originalTitle = useRef(document.title);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      let index = 0;
      intervalRef.current = setInterval(() => {
        document.title = messages[index % messages.length];
        index++;
      }, 1000);
    } else {
      document.title = originalTitle.current;
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.title = originalTitle.current;
    };
  }, [isActive]);
};

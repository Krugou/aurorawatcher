import { useEffect, useRef } from 'react';

export const useTitleFlasher = (isActive: boolean, messages: string[] = ['🔴 ALERT!']) => {
  const originalTitle = useRef(document.title);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const original = originalTitle.current;
    if (isActive) {
      let index = 0;
      intervalRef.current = setInterval(() => {
        document.title = messages[index % messages.length];
        index++;
      }, 1000);
    } else {
      document.title = original;
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.title = original;
    };
  }, [isActive, messages]);
};

import { useEffect,useState } from 'react';

export const useImageMetadata = (url: string, refreshTrigger: number) => {
  const [lastModified, setLastModified] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Try to fetch headers. Note: This will fail if CORS is not enabled on the target server.
        const response = await fetch(url + `?t=${Date.now()}`, { method: 'HEAD' });
        const dateHeader = response.headers.get('Last-Modified');
        if (dateHeader) {
          const date = new Date(dateHeader);
          setLastModified(date.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' }));
        } else {
          // Fallback: If we can't read headers, we might just assume it's live/current
          // But strictly speaking we don't know the file time.
          setLastModified(null);
        }
      } catch {
        // CORS or network error, silently fail and show nothing (or LIVE)
        setLastModified(null);
      }
    };

    fetchMetadata();
  }, [url, refreshTrigger]);

  return lastModified;
};

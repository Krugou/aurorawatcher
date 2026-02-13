import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HistoryEntry {
  timestamp: number;
  camId: string;
  filename: string;
}

interface HistoryData {
  lastUpdated: number;
  entries: HistoryEntry[];
}

interface HistorySliderProps {
  camId: string;
  currentImageUrl: string;
}

export const HistorySlider = ({ camId, currentImageUrl }: HistorySliderProps) => {
  const { t } = useTranslation();
  // URL to fetch data directly from GitHub (bypassing GitHub Pages cache/build times)
  const RAW_DATA_BASE = 'https://raw.githubusercontent.com/Krugou/aurorawatcher/main/web/public/';

  const [fullHistory, setFullHistory] = useState<HistoryEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRange, setTimeRange] = useState<number>(24); // Hours

  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`${RAW_DATA_BASE}data/history_index.json?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error('No history available');
        return res.json();
      })
      .then((data: HistoryData) => {
        console.log(`Loaded ${data.entries.length} entries. Filtering for ${camId}...`);

        // Filter for this camera and sort by time
        const camHistory = data.entries
          .filter((e) => e.camId === camId)
          .sort((a, b) => a.timestamp - b.timestamp);

        setFullHistory(camHistory);
        setHistory(camHistory);
        setCurrentIndex(camHistory.length); // Default to live
      })
      .catch((err: unknown) => {
        console.warn('Failed to load history:', err);
        setFullHistory([]);
        setHistory([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [camId]);

  // Filter history based on time range
  useEffect(() => {
    if (fullHistory.length === 0) return;

    const now = Date.now();
    const cutoff = now - timeRange * 60 * 60 * 1000;

    const filtered = fullHistory.filter((e) => e.timestamp >= cutoff);

    // Only update state if length changes or we need to reset invalid index
    // Use a function setter or check current value to avoid loop if adding history as dep?
    // Actually simplicity is key: checks below break loops
    setHistory((prev) => {
      if (prev.length === filtered.length && prev[0]?.timestamp === filtered[0]?.timestamp) {
        return prev;
      }
      return filtered;
    });

    // Reset to live when changing range if we were live or out of bounds
    // We check against 'filtered.length' effectively
    if (currentIndex >= filtered.length || currentIndex === -1) {
      setCurrentIndex(filtered.length);
    }
    // If we are viewing history that still exists in the new filter, keep the index (crudely)
    // Ideally we'd match timestamps but maintaining "live" is the primary UX goal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, fullHistory]); // Removed currentIndex to fix logic loop, added logic inside to handle index

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length) {
            return 0; // Loop back to the beginning
          }
          return prev + 1;
        });
      }, 500); // 2fps
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, history.length]);

  const isLive = currentIndex >= history.length || history.length === 0;
  const currentEntry = !isLive ? history[currentIndex] : null;

  // Determine image source
  const displayImage =
    !isLive && currentEntry
      ? `${RAW_DATA_BASE}data/${currentEntry.filename}` // Historical (Raw GitHub)
      : `${currentImageUrl}?t=${Date.now()}`; // Live

  // Format time
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayTime = isLive ? t('history.live') : formatTime(currentEntry?.timestamp ?? 0);

  const ranges = [6, 24, 72, 168, 720];

  return (
    <div className="flex flex-col gap-4">
      {/* Time Range Selector */}
      <div className="flex justify-center gap-0">
        {ranges.map((h) => (
          <button
            key={h}
            onClick={() => {
              setTimeRange(h);
            }}
            className={`px-4 py-3 border-2 text-sm font-bold font-mono transition-colors min-w-[50px] ${
              timeRange === h
                ? 'bg-neo-blue border-black text-white shadow-neo-sm z-10'
                : 'bg-white text-black border-black border-l-0 first:border-l-2 hover:bg-gray-200 dark:bg-zinc-800 dark:text-white dark:border-white'
            }`}
          >
            {h === 720
              ? t('history.range_30d')
              : h === 168
                ? t('history.range_7d')
                : h === 72
                  ? t('history.range_3d')
                  : h === 24
                    ? t('history.range_24h')
                    : t('history.range_6h')}
          </button>
        ))}
      </div>

      {/* Image Display */}
      <div className="relative border-2 border-black dark:border-white bg-black group shadow-neo dark:shadow-neo-dark w-full h-[35vh] max-h-[300px] md:max-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={displayImage}
          alt={isLive ? t('history.live_alt') : t('history.hist_alt')}
          className="w-full h-full object-contain"
        />

        {/* Time Overlay */}
        <div className="absolute top-4 left-4 bg-black/80 px-3 py-1.5 border border-white">
          <span
            className={`font-mono font-bold text-base ${isLive ? 'text-red-500 animate-pulse' : 'text-white'}`}
          >
            {isLive ? t('history.live_label') : t('history.hist_label')}
          </span>
          <div className="text-white text-[10px] font-mono">{displayTime}</div>
        </div>
      </div>

      {/* Controls */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-black border-2 border-black dark:border-white p-3 shadow-neo-sm dark:shadow-neo-sm-dark">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={() => {
                if (isLive) setCurrentIndex(0); // Restart if at end
                setIsPlaying(!isPlaying);
              }}
              className="w-12 h-12 flex items-center justify-center border-2 border-black dark:border-white bg-neo-yellow hover:bg-yellow-400 text-black transition-colors shadow-neo-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0"
              title={isPlaying ? t('history.pause') : t('history.play')}
            >
              {isPlaying ? (
                <span className="font-bold text-xl">II</span>
              ) : (
                <span className="font-bold text-xl">▶</span>
              )}
            </button>

            <span className="text-xs text-black dark:text-white font-mono w-14 text-right hidden sm:block">
              {history.length > 0 ? formatTime(history[0].timestamp) : '--:--'}
            </span>

            <input
              type="range"
              min={0}
              max={history.length}
              value={currentIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentIndex(parseInt(e.target.value));
              }}
              className="flex-1 h-10 bg-gray-200 dark:bg-zinc-800 appearance-none border-2 border-black dark:border-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:bg-neo-pink [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:cursor-pointer"
            />

            <span className="text-xs text-black dark:text-white font-mono w-10 text-left hidden sm:block">
              {t('grid.live')}
            </span>
          </div>

          <div className="flex justify-between items-center mt-3 px-1">
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentIndex === 0}
              className="px-4 py-2 border-2 border-black dark:border-white bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-bold font-mono text-xs uppercase hover:bg-gray-200 disabled:opacity-50 min-w-[70px]"
            >
              &lt; {t('history.prev')}
            </button>
            <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">
              {history.length} {t('history.frames')}
            </div>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex((prev) => Math.min(history.length, prev + 1));
              }}
              disabled={isLive}
              className="px-4 py-2 border-2 border-black dark:border-white bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-bold font-mono text-xs uppercase hover:bg-gray-200 disabled:opacity-50 min-w-[70px]"
            >
              {t('history.next')} &gt;
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center font-mono text-black dark:text-white animate-pulse">
          {t('history.loading')}
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="text-center font-mono text-gray-500 border-2 border-dashed border-gray-400 p-4">
          {t('history.no_data')}
        </div>
      )}
    </div>
  );
};

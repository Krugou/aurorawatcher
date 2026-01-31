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
  const [fullHistory, setFullHistory] = useState<HistoryEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRange, setTimeRange] = useState<number>(24); // Hours

  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/history_index.json?t=${Date.now()}`)
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
      .catch((err) => {
        console.warn('Failed to load history:', err);
        setFullHistory([]);
        setHistory([]);
      })
      .finally(() => setLoading(false));
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
  }, [timeRange, fullHistory]); // Removed currentIndex to fix logic loop, added logic inside to handle index

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= history.length) {
            setIsPlaying(false);
            return prev;
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
  const displayImage = !isLive && currentEntry
    ? `${import.meta.env.BASE_URL}data/${currentEntry.filename}` // Historical
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

  const displayTime = isLive
    ? t('history.live', 'LIVE NOW')
    : formatTime(currentEntry?.timestamp || 0);

  const ranges = [6, 24, 72, 168];

  return (
    <div className="flex flex-col gap-4">
      {/* Time Range Selector */}
      <div className="flex justify-center gap-2">
        {ranges.map((h) => (
          <button
            key={h}
            onClick={() => setTimeRange(h)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
              timeRange === h
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {h === 168 ? '7d' : h === 72 ? '3d' : `${h}h`}
          </button>
        ))}
      </div>

      {/* Image Display */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black aspect-video group">
        <img
          src={displayImage}
          alt={isLive ? 'Live View' : 'Historical View'}
          className="w-full h-full object-contain"
        />

        {/* Time Overlay */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
          <span
            className={`font-mono font-bold text-lg ${isLive ? 'text-red-500 animate-pulse' : 'text-white'}`}
          >
            {isLive ? '🔴 ' : '🕒 '}
            {displayTime}
          </span>
        </div>
      </div>

      {/* Controls */}
      {history.length > 0 && (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={() => {
                if (isLive) setCurrentIndex(0); // Restart if at end
                setIsPlaying(!isPlaying);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-700 text-white hover:bg-blue-600 transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <span className="font-bold">⏸</span>
              ) : (
                <span className="font-bold ml-1">▶</span>
              )}
            </button>

            <span className="text-xs text-slate-400 font-mono w-12 text-right hidden sm:block">
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
              className="flex-1 h-8 sm:h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all touch-none"
            />

            <span className="text-xs text-slate-400 font-mono w-12 text-left hidden sm:block">
              {t('history.liveShort', 'LIVE')}
            </span>
          </div>

          <div className="flex justify-between items-center mt-2 px-1">
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex((prev) => Math.max(0, prev - 1));
              }}
              disabled={currentIndex === 0}
              className="px-3 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors text-sm"
            >
              ← {t('history.prev', 'Prev')}
            </button>
            <div className="text-xs text-slate-500">{history.length} frames</div>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex((prev) => Math.min(history.length, prev + 1));
              }}
              disabled={isLive}
              className="px-3 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors text-sm"
            >
              {t('history.next', 'Next')} →
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-slate-500 text-sm animate-pulse">
          {t('history.loading', 'Loading history...')}
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="text-center text-slate-500 text-sm">
          {t('history.noData', 'No history data available yet.')}
          <div className="text-xs text-slate-700 mt-1">
             Debug: CamID={camId}, Entries={fullHistory.length} (Filtered from fetch)
          </div>
        </div>
      )}
    </div>
  );
};

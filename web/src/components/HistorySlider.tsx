import { useEffect, useState } from 'react';
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
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  useEffect(() => {
    fetch('/data/history.json')
      .then((res) => {
        if (!res.ok) throw new Error('No history available');
        return res.json();
      })
      .then((data: HistoryData) => {
        // Filter for this camera and sort by time
        const camHistory = data.entries
          .filter((e) => e.camId === camId)
          .sort((a, b) => a.timestamp - b.timestamp);
        setHistory(camHistory);
        // Default to latest (live)
        setCurrentIndex(camHistory.length);
      })
      .catch((err) => {
        console.warn('Failed to load history:', err);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  }, [camId]);

  const isLive = currentIndex >= history.length;
  const currentEntry = !isLive ? history[currentIndex] : null;

  // Determine image source
  const displayImage = isLive
    ? `${currentImageUrl}?t=${Date.now()}` // Live
    : `/data/${currentEntry?.filename}`; // Historical

  // Format time
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const displayTime = isLive
    ? t('history.live', 'LIVE NOW')
    : formatTime(currentEntry?.timestamp || 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Image Display */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black aspect-video">
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
            <span className="text-xs text-slate-400 font-mono w-12 text-right">
              {history.length > 0 ? formatTime(history[0].timestamp) : '--:--'}
            </span>

            <input
              type="range"
              min={0}
              max={history.length}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />

            <span className="text-xs text-slate-400 font-mono w-12 text-left">
              {t('history.liveShort', 'LIVE')}
            </span>
          </div>

          <div className="flex justify-between items-center mt-2 px-1">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              Example: Previous frame
            </button>
            <div className="text-xs text-slate-500">
              {isLive
                ? t('history.viewingLive', 'Viewing Live Feed')
                : t('history.viewingPast', {
                    time: formatTime(currentEntry!.timestamp),
                    defaultValue: 'Viewing: {{time}}',
                  })}
            </div>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(history.length, prev + 1))}
              disabled={isLive}
              className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              Example: Next frame
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
        </div>
      )}
    </div>
  );
};

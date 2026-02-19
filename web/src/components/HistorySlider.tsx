import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LoadingAurora } from './LoadingAurora';

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

    setHistory((prev) => {
      if (prev.length === filtered.length && prev[0]?.timestamp === filtered[0]?.timestamp) {
        return prev;
      }
      return filtered;
    });

    if (currentIndex >= filtered.length || currentIndex === -1) {
      setCurrentIndex(filtered.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, fullHistory]);

  const [isFullscreen, setIsFullscreen] = useState(false);

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
  const oldestTime = fullHistory.length > 0 ? formatTime(fullHistory[0].timestamp) : null;

  const ranges = [6, 24, 72, 168, 720];

  return (
    <div className="flex flex-col gap-4">
      {/* Time Range Selector */}
      <div className="flex flex-col gap-2">
        {oldestTime && (
          <div className="text-center text-xs font-mono text-white/40">
            {t('history.oldest', { time: oldestTime })}
          </div>
        )}
        <div className="flex justify-center gap-1 scale-75 sm:scale-100 origin-center transition-transform">
          {ranges.map((h) => (
            <button
              key={h}
              onClick={() => {
                setTimeRange(h);
              }}
              className={`px-4 py-2 text-sm font-bold font-mono transition-all duration-300 rounded-lg min-w-[50px] ${
                timeRange === h
                  ? 'bg-aurora-blue border border-aurora-blue/50 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
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
      </div>

      {/* Image Display */}
      <div className="relative rounded-xl border border-white/10 bg-black/40 group w-full h-[35vh] max-h-[300px] md:max-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src={displayImage}
          alt={isLive ? t('history.live_alt') : t('history.hist_alt')}
          className="w-full h-full object-contain"
        />

        {/* Time Overlay */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 max-w-[70%]">
          <span
            className={`font-mono font-bold text-base ${isLive ? 'text-red-400 animate-pulse' : 'text-white'}`}
          >
            {isLive ? t('history.live_label') : t('history.hist_label')}
          </span>
          <div className="text-white/60 text-[10px] font-mono">{displayTime}</div>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => {
            setIsFullscreen(true);
          }}
          className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-sm text-white p-2 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 z-10 opacity-70 hover:opacity-100"
          title={t('history.fullscreen')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-100 bg-black flex items-center justify-center p-4">
          <button
            onClick={() => {
              setIsFullscreen(false);
            }}
            className="absolute top-4 right-4 z-101 bg-white/10 backdrop-blur-sm text-white p-2 rounded-full border border-white/20 hover:bg-red-500/80 transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="absolute top-4 left-4 z-101 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
            <span
              className={`font-mono font-bold text-xl ${isLive ? 'text-red-400 animate-pulse' : 'text-white'}`}
            >
              {isLive ? t('history.live_label') : t('history.hist_label')}
            </span>
            <div className="text-white/60 text-sm font-mono">{displayTime}</div>
          </div>

          <button
            type="button"
            className="w-full h-full p-0 border-0 bg-transparent cursor-pointer flex items-center justify-center"
            onClick={() => {
              setIsFullscreen(false);
            }}
          >
            <img src={displayImage} alt="Fullscreen" className="w-full h-full object-contain" />
          </button>
        </div>
      )}

      {/* Controls */}
      {history.length > 0 && (
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={() => {
                if (isLive) setCurrentIndex(0); // Restart if at end
                setIsPlaying(!isPlaying);
              }}
              className="w-12 h-12 flex items-center justify-center rounded-lg bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal hover:bg-aurora-teal/20 hover:shadow-[0_0_12px_rgba(0,212,170,0.2)] transition-all duration-300 shrink-0"
              title={isPlaying ? t('history.pause') : t('history.play')}
            >
              {isPlaying ? (
                <span className="font-bold text-xl">II</span>
              ) : (
                <span className="font-bold text-xl">▶</span>
              )}
            </button>

            <span className="text-xs text-white/40 font-mono w-14 text-right hidden sm:block">
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
              className="flex-1 h-2 bg-white/10 appearance-none rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-aurora-teal [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,212,170,0.4)]"
            />

            <span className="text-xs text-white/40 font-mono w-10 text-left hidden sm:block">
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
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 font-bold font-mono text-xs uppercase hover:bg-white/10 disabled:opacity-30 min-w-[70px] transition-all duration-300"
            >
              &lt; {t('history.prev')}
            </button>
            <div className="text-xs text-white/30 font-mono uppercase tracking-widest">
              {history.length} {t('history.frames')}
            </div>
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentIndex((prev) => Math.min(history.length, prev + 1));
              }}
              disabled={isLive}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 font-bold font-mono text-xs uppercase hover:bg-white/10 disabled:opacity-30 min-w-[70px] transition-all duration-300"
            >
              {t('history.next')} &gt;
            </button>
          </div>
        </div>
      )}

      {loading && <LoadingAurora />}

      {!loading && history.length === 0 && (
        <div className="text-center font-mono text-white/30 border border-white/10 rounded-xl p-6">
          {t('history.no_data')}
        </div>
      )}
    </div>
  );
};

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { analyzeAuroraImage, AuroraColorAnalysis } from '../utils/auroraColorDetection';

interface HistoryEntry {
  timestamp: number;
  camId: string;
  filename: string;
}

interface KeptAuroraImage extends HistoryEntry {
  score: number;
  greenPixels: number;
  purplePixels: number;
  redPixels: number;
}

interface HistoryIndex {
  entries: HistoryEntry[];
}

interface ScanProgress {
  current: number;
  total: number;
  found: number;
}

const STORAGE_KEY = 'aurora_gallery_keep_list_v1';
const SCAN_LIMIT = 80;
const CAMERA_IDS = new Set(['muonio', 'nyrola', 'hankasalmi', 'metsahovi']);
const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

const readKeepList = (): KeptAuroraImage[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is KeptAuroraImage =>
        typeof item?.camId === 'string' &&
        typeof item?.filename === 'string' &&
        typeof item?.timestamp === 'number' &&
        typeof item?.score === 'number',
    );
  } catch {
    return [];
  }
};

const inspectImage = async (
  entry: HistoryEntry,
): Promise<{ match: KeptAuroraImage | null; unavailable: boolean }> => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.decoding = 'async';
  image.src = `${DATA_BASE}${entry.filename}`;

  try {
    await image.decode();
    const analysis: AuroraColorAnalysis = analyzeAuroraImage(image);
    if (!analysis.hasAurora) return { match: null, unavailable: false };

    return {
      match: {
        ...entry,
        score: analysis.score,
        greenPixels: analysis.greenPixels,
        purplePixels: analysis.purplePixels,
        redPixels: analysis.redPixels,
      },
      unavailable: false,
    };
  } catch {
    return { match: null, unavailable: true };
  }
};

const getImageKey = (entry: HistoryEntry) => `${entry.camId}:${entry.timestamp}`;

export const AuroraGallery = () => {
  const { t, i18n } = useTranslation();
  const [keepList, setKeepList] = useState<KeptAuroraImage[]>(readKeepList);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [scanError, setScanError] = useState(false);
  const [lastScan, setLastScan] = useState<{
    found: number;
    scanned: number;
    unavailable: number;
  } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keepList));
    } catch {
      // The gallery remains usable for the current session if browser storage is disabled.
    }
  }, [keepList]);

  const sortedKeepList = useMemo(
    () => [...keepList].sort((a, b) => b.timestamp - a.timestamp),
    [keepList],
  );

  const scanArchive = async () => {
    setScanError(false);
    setLastScan(null);

    try {
      const response = await fetch(`${DATA_BASE}history_index.json?t=${Date.now()}`);
      if (!response.ok) throw new Error(`History index request failed (${response.status})`);
      const index = (await response.json()) as HistoryIndex;
      const entries = index.entries
        .filter(
          (entry) =>
            CAMERA_IDS.has(entry.camId) &&
            entry.filename.startsWith('history/') &&
            !entry.filename.includes('..'),
        )
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, SCAN_LIMIT);

      if (entries.length === 0) {
        setLastScan({ found: 0, scanned: 0, unavailable: 0 });
        return;
      }

      setProgress({ current: 0, total: entries.length, found: 0 });
      const matches: KeptAuroraImage[] = [];
      let unavailable = 0;

      for (let offset = 0; offset < entries.length; offset += 4) {
        const batch = entries.slice(offset, offset + 4);
        const inspected = await Promise.all(batch.map(inspectImage));

        for (const result of inspected) {
          if (result.match) matches.push(result.match);
          if (result.unavailable) unavailable += 1;
        }

        setProgress({
          current: Math.min(offset + batch.length, entries.length),
          total: entries.length,
          found: matches.length,
        });
      }

      setKeepList((previous) => {
        const byKey = new Map(previous.map((entry) => [getImageKey(entry), entry]));
        matches.forEach((entry) => byKey.set(getImageKey(entry), entry));
        return [...byKey.values()];
      });
      setLastScan({ found: matches.length, scanned: entries.length, unavailable });
    } catch {
      setScanError(true);
    } finally {
      setProgress(null);
    }
  };

  const removeFromKeepList = (target: KeptAuroraImage) => {
    setKeepList((previous) =>
      previous.filter((entry) => getImageKey(entry) !== getImageKey(target)),
    );
  };

  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(timestamp);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-aurora-teal/20 bg-gradient-to-br from-aurora-teal/[0.12] via-white/[0.03] to-aurora-violet/[0.12] p-5 md:p-7">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-aurora-teal/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.24em] text-aurora-teal">
              {t('gallery.eyebrow')}
            </p>
            <h3 className="text-2xl font-bold text-white md:text-3xl">{t('gallery.heading')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{t('gallery.description')}</p>
            <p className="mt-2 font-mono text-xs text-white/35">{t('gallery.localStorageNote')}</p>
          </div>
          <button
            type="button"
            onClick={scanArchive}
            disabled={progress !== null}
            className="shrink-0 rounded-xl border border-aurora-teal/50 bg-aurora-teal/15 px-5 py-3 font-mono text-sm font-bold text-aurora-teal shadow-[0_0_24px_rgba(0,212,170,0.12)] transition hover:bg-aurora-teal/25 hover:shadow-[0_0_30px_rgba(0,212,170,0.22)] disabled:cursor-wait disabled:opacity-60"
          >
            {progress ? t('gallery.scanning') : t('gallery.scanButton', { count: SCAN_LIMIT })}
          </button>
        </div>
        {progress && (
          <div className="relative mt-5" aria-live="polite">
            <div className="mb-2 flex justify-between font-mono text-xs text-white/55">
              <span>{t('gallery.progress', { ...progress })}</span>
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-black/40"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={progress.total}
              aria-valuenow={progress.current}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-aurora-teal to-aurora-blue transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
        {scanError && (
          <p
            className="relative mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {t('gallery.scanError')}
          </p>
        )}
        {lastScan && (
          <p className="relative mt-4 text-sm text-white/70" role="status">
            {t('gallery.scanComplete', lastScan)}
          </p>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">{t('gallery.keepList')}</h3>
          <p className="mt-1 font-mono text-xs text-white/40">
            {t('gallery.savedCount', { count: sortedKeepList.length })}
          </p>
        </div>
        {sortedKeepList.length > 0 && (
          <button
            type="button"
            onClick={() => setKeepList([])}
            className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs text-white/55 transition hover:border-red-400/30 hover:text-red-300"
          >
            {t('gallery.clear')}
          </button>
        )}
      </div>

      {sortedKeepList.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-aurora-teal/20 bg-aurora-teal/10 text-2xl text-aurora-teal">
            ✦
          </div>
          <p className="font-semibold text-white/80">{t('gallery.emptyTitle')}</p>
          <p className="mt-2 max-w-md text-sm text-white/45">{t('gallery.emptyDescription')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedKeepList.map((entry) => (
            <article
              key={getImageKey(entry)}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111319] transition duration-300 hover:-translate-y-1 hover:border-aurora-teal/35 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-black/50">
                <img
                  src={`${DATA_BASE}${entry.filename}`}
                  alt={t('gallery.imageAlt', {
                    camera: t(`common.loc.${entry.camId}`, { defaultValue: entry.camId }),
                    date: formatDate(entry.timestamp),
                  })}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <span className="absolute left-3 top-3 rounded-full border border-aurora-teal/35 bg-black/65 px-3 py-1 font-mono text-xs font-bold text-aurora-teal backdrop-blur">
                  {t('gallery.matchScore', { score: entry.score })}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromKeepList(entry)}
                  aria-label={t('gallery.remove', {
                    camera: t(`common.loc.${entry.camId}`, { defaultValue: entry.camId }),
                  })}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white/70 backdrop-blur transition hover:border-red-300/40 hover:text-red-300"
                >
                  ×
                </button>
                <div className="absolute inset-x-4 bottom-4">
                  <p className="font-semibold text-white">
                    {t(`common.loc.${entry.camId}`, { defaultValue: entry.camId })}
                  </p>
                  <p className="mt-1 font-mono text-xs text-white/65">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 p-3 font-mono text-[10px] uppercase tracking-wider">
                {entry.greenPixels > 0 && (
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-emerald-200">
                    {t('gallery.green')}
                  </span>
                )}
                {entry.purplePixels > 0 && (
                  <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-2.5 py-1 text-fuchsia-200">
                    {t('gallery.purple')}
                  </span>
                )}
                {entry.redPixels > 0 && (
                  <span className="rounded-full border border-rose-300/20 bg-rose-300/10 px-2.5 py-1 text-rose-200">
                    {t('gallery.red')}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

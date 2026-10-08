import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rankAuroraGallery } from '../utils/auroraGalleryRanking';

interface KeptAuroraImage {
  timestamp: number;
  camId: string;
  filename: string;
  score: number;
  greenPixels: number;
  purplePixels: number;
  redPixels: number;
}

interface GalleryResponse {
  entries: KeptAuroraImage[];
}

const DATA_BASE = `${import.meta.env.BASE_URL}data/`;
export const AuroraGallery = () => {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<KeptAuroraImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${DATA_BASE}aurora_gallery.json?t=${Date.now()}`)
      .then((response) => {
        if (!response.ok) throw new Error('Gallery request failed');
        return response.json() as Promise<GalleryResponse>;
      })
      .then((gallery) => {
        if (active) setEntries(Array.isArray(gallery.entries) ? gallery.entries : []);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const sortedEntries = useMemo(() => rankAuroraGallery(entries), [entries]);
  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(
      timestamp,
    );
  const getPlaceName = (camId: string) =>
    t(`common.loc.${camId}_full`, {
      defaultValue: t(`common.loc.${camId}`, { defaultValue: camId }),
    });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-aurora-teal/20 bg-gradient-to-br from-aurora-teal/[0.12] via-white/[0.03] to-aurora-violet/[0.12] p-5 md:p-7">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-aurora-teal/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.24em] text-aurora-teal">
            {t('gallery.eyebrow')}
          </p>
          <h3 className="text-2xl font-bold text-white md:text-3xl">{t('gallery.heading')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{t('gallery.description')}</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">{t('gallery.keepList')}</h3>
          <p className="mt-1 font-mono text-xs text-white/40">
            {t('gallery.savedCount', { count: sortedEntries.length })}
          </p>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-white/50" role="status">
          {t('gallery.loading')}
        </p>
      ) : loadError ? (
        <p
          className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-6 text-center text-sm text-red-200"
          role="alert"
        >
          {t('gallery.loadError')}
        </p>
      ) : sortedEntries.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-aurora-teal/20 bg-aurora-teal/10 text-2xl text-aurora-teal">
            ✦
          </div>
          <p className="font-semibold text-white/80">{t('gallery.emptyTitle')}</p>
          <p className="mt-2 max-w-md text-sm text-white/45">{t('gallery.emptyDescription')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedEntries.map((entry) => (
            <article
              key={`${entry.camId}:${entry.timestamp}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111319] transition duration-300 hover:-translate-y-1 hover:border-aurora-teal/35 hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-black/50">
                <img
                  src={`${DATA_BASE}${entry.filename}`}
                  alt={t('gallery.imageAlt', {
                    camera: getPlaceName(entry.camId),
                    date: formatDate(entry.timestamp),
                  })}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <span className="absolute left-3 top-3 rounded-full border border-aurora-teal/35 bg-black/65 px-3 py-1 font-mono text-xs font-bold text-aurora-teal backdrop-blur">
                  {t('gallery.matchScore', { score: entry.score })}
                </span>
                <div className="absolute inset-x-4 bottom-4">
                  <p className="font-semibold text-white">{getPlaceName(entry.camId)}</p>
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

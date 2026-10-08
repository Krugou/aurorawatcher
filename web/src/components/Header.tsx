import { useTranslation } from 'react-i18next';

import { useSolarActivity } from '../hooks/useSolarActivity';

export const Header = () => {
  const { t } = useTranslation();
  const { data, loading, error, lastUpdated } = useSolarActivity();
  const activityLevel = data
    ? data.kp >= 5
      ? t('status.high')
      : data.kp >= 3
        ? t('status.moderate')
        : data.kp >= 1
          ? t('status.low')
          : t('status.quiet')
    : t('status.unknown');
  const liveStatus = data
    ? `${t('status.kp')}: ${data.kp.toFixed(1)} · ${t('status.speed')}: ${Math.round(data.speed)} km/s · ${t('status.bz')}: ${data.bz.toFixed(1)} nT · ${activityLevel}`
    : loading
      ? t('status.loading')
      : t('status.unavailable');

  return (
    <header className="text-center relative mb-8 neo-panel">
      <div className="relative overflow-hidden bg-[#10151a] border-b-2 border-aurora-teal p-8 group">
        <div className="absolute top-0 left-0 w-full h-1 bg-aurora-teal" />

        <div className="relative z-10">
          <h1
            className={`glitch-heading text-6xl md:text-8xl font-sans font-extrabold uppercase tracking-tighter text-white mb-3 transition-all duration-700 group-hover:text-glow ${data && data.kp > 5 ? 'is-glitching' : ''}`}
            data-text={t('app.title')}
          >
            {t('app.title')}
          </h1>
          <div className="inline-block bg-[#07090c] text-white px-5 py-1.5 font-mono text-sm uppercase font-bold tracking-widest border-2 border-white">
            {t('header.subtitle')}
          </div>
        </div>

        <div className="status-board border-t-2 border-white/30 bg-black text-left">
          <p className="sr-only" role="status" aria-live="polite">
            {liveStatus}
            {error && lastUpdated ? ` · ${t('status.stale')}` : ''}
          </p>
          <div className="status-marquee overflow-hidden" aria-hidden="true">
            <div className="animate-marquee whitespace-nowrap font-mono text-white text-xs uppercase tracking-widest py-2">
              {`● ${liveStatus}${error && lastUpdated ? ` · ${t('status.stale')}` : ''}　///　${liveStatus}${error && lastUpdated ? ` · ${t('status.stale')}` : ''}`}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

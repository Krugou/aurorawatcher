import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { t } = useTranslation();
  return (
    <header className="text-center relative mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 group">
        {/* Subtle aurora gradient line at top */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-aurora-teal/60 to-transparent" />

        {/* Ambient aurora glow background */}
        <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-aurora-teal via-transparent to-aurora-violet pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-6xl md:text-8xl font-sans font-extrabold uppercase tracking-tighter text-white mb-3 transition-all duration-700 group-hover:text-glow">
            {t('app.title')}
          </h1>
          <div className="inline-block bg-white/[0.06] backdrop-blur-sm text-white/70 px-5 py-1.5 rounded-full font-mono text-sm uppercase font-medium tracking-widest border border-white/10">
            {t('header.subtitle')}
          </div>
        </div>

        {/* Scrolling status text — subtle and cinematic */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden opacity-30">
          <div className="animate-marquee whitespace-nowrap font-mono text-aurora-teal/60 text-[10px] uppercase tracking-widest py-1">
            {`/// ${t('common.status_online')} /// ${t('common.monitoring_solar')} /// ${t('common.checking_mag')} /// ${t('common.kp_stable')} ///`}
          </div>
        </div>
      </div>
    </header>
  );
};

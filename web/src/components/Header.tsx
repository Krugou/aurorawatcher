import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { t } = useTranslation();
  return (
    <header className="text-center relative mb-8">
      <div className="border-2 border-black dark:border-white shadow-neo dark:shadow-neo-dark bg-white dark:bg-black p-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full bg-neo-yellow h-8 border-b-2 border-black dark:border-white flex items-center overflow-hidden">
          <div className="animate-marquee whitespace-nowrap font-mono font-bold text-black text-sm uppercase tracking-widest">
            {`/// ${t('common.status_online')} /// ${t('common.monitoring_solar')} /// ${t('common.checking_mag')} /// ${t('common.kp_stable')} ///`}
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-6xl md:text-8xl font-display font-bold uppercase tracking-tighter text-black dark:text-white mb-2 group-hover:animate-glitch">
            {t('app.title')}
          </h1>
          <div className="inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-1 font-mono text-sm uppercase font-bold tracking-widest transform -rotate-1">
            {t('header.subtitle')}
          </div>
        </div>
      </div>
    </header>
  );
};

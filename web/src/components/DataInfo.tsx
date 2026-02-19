import { useTranslation } from 'react-i18next';

export const DataInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300">
          <h3 className="text-white/90 font-bold font-sans text-lg mb-3 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-aurora-blue shadow-[0_0_8px_rgba(59,130,246,0.4)]"></span>
            {t('data_info.fmi_title')}
          </h3>
          <p className="text-sm font-mono text-white/40 leading-relaxed">
            {t('data_info.fmi_desc')}
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://en.ilmatieteenlaitos.fi/open-data"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium font-mono text-aurora-blue bg-aurora-blue/10 px-3 py-1.5 rounded-lg border border-aurora-blue/20 hover:bg-aurora-blue/20 transition-colors duration-300"
            >
              {t('data_info.fmi_link')}
            </a>
            <a
              href="https://space.fmi.fi/MIRACLE/RWC/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium font-mono text-aurora-blue bg-aurora-blue/10 px-3 py-1.5 rounded-lg border border-aurora-blue/20 hover:bg-aurora-blue/20 transition-colors duration-300"
            >
              {t('data_info.miracle_link')}
            </a>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all duration-300">
          <h3 className="text-white/90 font-bold font-sans text-lg mb-3 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-aurora-violet shadow-[0_0_8px_rgba(139,92,246,0.4)]"></span>
            {t('data_info.noaa_title')}
          </h3>
          <p className="text-sm font-mono text-white/40 leading-relaxed">
            {t('data_info.noaa_desc')}
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://www.swpc.noaa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium font-mono text-aurora-violet bg-aurora-violet/10 px-3 py-1.5 rounded-lg border border-aurora-violet/20 hover:bg-aurora-violet/20 transition-colors duration-300"
            >
              {t('data_info.noaa_link')}
            </a>
            <a
              href="https://services.swpc.noaa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium font-mono text-aurora-violet bg-aurora-violet/10 px-3 py-1.5 rounded-lg border border-aurora-violet/20 hover:bg-aurora-violet/20 transition-colors duration-300"
            >
              {t('data_info.json_link')}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <p className="text-xs font-mono text-white/30 text-center">{t('data_info.disclaimer')}</p>
      </div>
    </>
  );
};

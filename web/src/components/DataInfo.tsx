import { useTranslation } from 'react-i18next';

export const DataInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border-2 border-black dark:border-white bg-white dark:bg-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
          <h3 className="text-black dark:text-white font-bold font-display uppercase text-xl mb-3 flex items-center gap-2">
            <span className="w-4 h-4 bg-neo-blue border border-black"></span>
            {t('data_info.fmi_title')}
          </h3>
          <p className="text-sm font-mono text-gray-600 dark:text-gray-300 leading-relaxed uppercase">
            {t('data_info.fmi_desc')}
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://en.ilmatieteenlaitos.fi/open-data"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold font-mono text-white bg-neo-blue px-2 py-1 border border-black hover:bg-white hover:text-black transition-colors"
            >
              {t('data_info.fmi_link')}
            </a>
            <a
              href="https://space.fmi.fi/MIRACLE/RWC/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold font-mono text-white bg-neo-blue px-2 py-1 border border-black hover:bg-white hover:text-black transition-colors"
            >
              {t('data_info.miracle_link')}
            </a>
          </div>
        </div>

        <div className="p-6 border-2 border-black dark:border-white bg-white dark:bg-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
          <h3 className="text-black dark:text-white font-bold font-display uppercase text-xl mb-3 flex items-center gap-2">
            <span className="w-4 h-4 bg-neo-orange border border-black"></span>
            {t('data_info.noaa_title')}
          </h3>
          <p className="text-sm font-mono text-gray-600 dark:text-gray-300 leading-relaxed uppercase">
            {t('data_info.noaa_desc')}
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://www.swpc.noaa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold font-mono text-black dark:text-white bg-neo-orange px-2 py-1 border border-black hover:bg-white hover:text-black transition-colors"
            >
              {t('data_info.noaa_link')}
            </a>
            <a
              href="https://services.swpc.noaa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold font-mono text-black dark:text-white bg-neo-orange px-2 py-1 border border-black hover:bg-white hover:text-black transition-colors"
            >
              {t('data_info.json_link')}
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t-2 border-dashed border-black dark:border-white">
        <p className="text-xs font-mono text-black dark:text-white uppercase tracking-wider text-center">
          {t('data_info.disclaimer')}
        </p>
      </div>
    </>
  );
};

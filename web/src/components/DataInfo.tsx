import { useTranslation } from 'react-i18next';

export const DataInfo = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border-2 border-black dark:border-white bg-white dark:bg-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
          <h3 className="text-black dark:text-white font-bold font-display uppercase text-xl mb-3 flex items-center gap-2">
            <span className="w-4 h-4 bg-neo-blue border border-black"></span>
            {t('data_info.fmi_title', 'FMI (Finnish Meteorological Institute)')}
          </h3>
          <p className="text-sm font-mono text-gray-600 dark:text-gray-300 leading-relaxed uppercase">
            {t(
              'data_info.fmi_desc',
              'Ground-level data is fetched directly from FMI Open Data APIs. This includes real-time magnetometer observations from stations across Finland and local weather forecasts (cloud cover, temperature) based on your geolocation.',
            )}
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://en.ilmatieteenlaitos.fi/open-data"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold font-mono text-black dark:text-white bg-neo-blue px-2 py-1 border border-black hover:bg-white hover:text-black transition-colors"
            >
              FMI Open Data
            </a>
            <a
              href="https://space.fmi.fi/MIRACLE/RWC/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold font-mono text-black dark:text-white bg-neo-blue px-2 py-1 border border-black hover:bg-white hover:text-black transition-colors"
            >
              MIRACLE Network
            </a>
          </div>
        </div>

        <div className="p-6 border-2 border-black dark:border-white bg-white dark:bg-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
          <h3 className="text-black dark:text-white font-bold font-display uppercase text-xl mb-3 flex items-center gap-2">
            <span className="w-4 h-4 bg-neo-orange border border-black"></span>
            {t('data_info.noaa_title', 'NOAA Space Weather Prediction Center')}
          </h3>
          <p className="text-sm font-mono text-gray-600 dark:text-gray-300 leading-relaxed uppercase">
            {t(
              'data_info.noaa_desc',
              'Solar wind parameters (Bz, Speed, Density) and the Planetary K-index are sourced from NOAA SWPC. This data is measured by satellites like DSCOVR at the L1 Lagrange point, providing a ~30-60 minute warning before solar wind hits Earth.',
            )}
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://www.swpc.noaa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold font-mono text-black dark:text-white bg-neo-orange px-2 py-1 border border-black hover:bg-white hover:text-black transition-colors"
            >
              NOAA SWPC
            </a>
            <a
              href="https://services.swpc.noaa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold font-mono text-black dark:text-white bg-neo-orange px-2 py-1 border border-black hover:bg-white hover:text-black transition-colors"
            >
              JSON Data Services
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t-2 border-dashed border-black dark:border-white">
        <p className="text-xs font-mono text-black dark:text-white uppercase tracking-wider text-center">
          {t(
            'data_info.disclaimer',
            'Note: Accurate aurora prediction depends on multiple variables. Even with perfect data, local visibility and fast-changing conditions play a huge role. Always trust your own eyes!',
          )}
        </p>
      </div>
    </>
  );
};

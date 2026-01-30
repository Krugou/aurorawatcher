import { useTranslation } from 'react-i18next';

export const DataInfo = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800/50 mb-12">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-blue-400">ℹ️</span>
        {t('data_info.title', 'How it Works & Data Sources')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            {t('data_info.fmi_title', 'FMI (Finnish Meteorological Institute)')}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
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
              className="text-xs text-blue-500 hover:underline"
            >
              FMI Open Data
            </a>
            <a
              href="https://space.fmi.fi/MIRACLE/RWC/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              MIRACLE Network
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
            {t('data_info.noaa_title', 'NOAA Space Weather Prediction Center')}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
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
              className="text-xs text-orange-500 hover:underline"
            >
              NOAA SWPC
            </a>
            <a
              href="https://services.swpc.noaa.gov/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-orange-500 hover:underline"
            >
              JSON Data Services
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/50">
        <p className="text-xs text-slate-500 italic">
          {t(
            'data_info.disclaimer',
            'Note: Accurate aurora prediction depends on multiple variables. Even with perfect data, local visibility and fast-changing conditions play a huge role. Always trust your own eyes!',
          )}
        </p>
      </div>
    </section>
  );
};

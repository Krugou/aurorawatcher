import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSolarData, SolarData } from '../services/solarService';
import { Skeleton } from './Skeleton';

export const SpaceWeather = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<SolarData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
             const result = await fetchSolarData();
             setData(result);
             setLoading(false);
        };
        load();

        // Refresh every minute
        const interval = setInterval(load, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
         return (
            <section className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800/50 mb-8">
                 <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <span className="text-2xl">☀️</span>
                    Space Weather
                 </h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full bg-slate-800 rounded-xl" />)}
                 </div>
            </section>
         );
    }

    if (!data) return null;

    // Helpers for coloring
    const getBzColor = (val: number) => val < -5 ? 'text-red-500' : val < 0 ? 'text-green-400' : 'text-slate-400';
    const getSpeedColor = (val: number) => val > 600 ? 'text-red-500' : val > 500 ? 'text-yellow-400' : 'text-slate-400';
    const getDensityColor = (val: number) => val > 20 ? 'text-red-500' : val > 10 ? 'text-yellow-400' : 'text-slate-400';
    const getKpColor = (val: number) => val >= 5 ? 'text-red-500' : val >= 4 ? 'text-yellow-400' : 'text-green-400';

    return (
        <section className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800/50 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                {t('space_weather.title', 'Space Weather (Live)')}
                <span className="text-xs font-normal text-slate-500 ml-auto bg-slate-800 px-3 py-1 rounded-full border border-slate-700">NOAA SWPC</span>
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Bz */}
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">{t('space_weather.bz', 'Bz (IMF)')}</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold ${getBzColor(data.bz)}`}>{data.bz}</span>
                        <span className="text-xs text-slate-500">nT</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{t('space_weather.bz_hint', 'Negative is better')}</p>
                </div>

                {/* Speed */}
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">{t('space_weather.speed', 'Solar Wind')}</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold ${getSpeedColor(data.speed)}`}>{Math.round(data.speed)}</span>
                        <span className="text-xs text-slate-500">km/s</span>
                    </div>
                     <p className="text-xs text-slate-500 mt-2">{t('space_weather.speed_hint', 'Faster is better')}</p>
                </div>

                 {/* Density */}
                 <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">{t('space_weather.density', 'Density')}</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold ${getDensityColor(data.density)}`}>{Math.round(data.density)}</span>
                        <span className="text-xs text-slate-500">p/cm³</span>
                    </div>
                     <p className="text-xs text-slate-500 mt-2">{t('space_weather.density_hint', 'Higher is better')}</p>
                </div>

                {/* Kp Index */}
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">{t('space_weather.kp', 'Kp Index')}</p>
                    <div className="flex items-center gap-2 mt-1">
                         <span className={`text-2xl font-bold ${getKpColor(data.kp)}`}>{data.kp}</span>
                         <div className="flex gap-0.5 h-3 flex-1">
                             {[0,1,2,3,4,5,6,7,8,9].map(level => (
                                 <div
                                    key={level}
                                    className={`flex-1 rounded-sm ${level < data.kp ? (level >= 5 ? 'bg-red-500' : 'bg-green-500') : 'bg-slate-700'}`}
                                 />
                             ))}
                         </div>
                    </div>
                     <p className="text-xs text-slate-500 mt-2">{t('space_weather.kp_hint', 'Planetary Activity')}</p>
                </div>
            </div>
        </section>
    );
};

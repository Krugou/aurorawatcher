import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Reusing locations from App but simplified for grid
interface Cam {
    name: string;
    url: string;
    id: string;
}

const CAMERAS: Cam[] = [
    { id: 'muonio', name: 'Muonio', url: 'https://space.fmi.fi/MIRACLE/RWC/latest_MUO.jpg' },
    { id: 'nyrola', name: 'Nyrölä', url: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR.jpg' },
    { id: 'hankasalmi', name: 'Hankasalmi', url: 'https://space.fmi.fi/MIRACLE/RWC/latest_SIR_AllSky.jpg' },
    { id: 'metsahovi', name: 'Metsähovi', url: 'https://space.fmi.fi/MIRACLE/RWC/latest_HOV.jpg' },
];

export const CameraGrid = () => {
    const { t } = useTranslation();
    const [selectedCam, setSelectedCam] = useState<Cam | null>(null);
    const timestamp = Date.now(); // Cache buster

    return (
        <section className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800/50 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                {t('section.cameras', 'Live Sky Cameras')}
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {CAMERAS.map((cam) => (
                    <button
                        key={cam.id}
                        onClick={() => setSelectedCam(cam)}
                        className="group relative aspect-video rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-friendly bg-black hover-lift"
                    >
                        <img
                            src={`${cam.url}?t=${timestamp}`}
                            alt={cam.name}
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-friendly scale-105 group-hover:scale-110"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-3 backdrop-blur-xs">
                            <span className="text-sm font-semibold text-white tracking-wide">{cam.name}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Modal */}
            {selectedCam && (
                /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
                <div
                    className="fixed inset-0 z-50 bg-black/98 flex items-center justify-center p-4 backdrop-blur-sm transition-friendly"
                    onClick={(e) => { if (e.target === e.currentTarget) setSelectedCam(null); }}
                    onKeyDown={(e) => { if (e.key === 'Escape') setSelectedCam(null); }}
                    role="dialog"
                    aria-modal="true"
                    tabIndex={-1}
                >
                    <div
                        className="max-w-5xl w-full relative animate-in fade-in zoom-in duration-300"
                    >
                        <img
                            src={`${selectedCam.url}?t=${timestamp}`}
                            alt={selectedCam.name}
                            className="w-full rounded-2xl shadow-blue-900/40 shadow-2xl border border-slate-800"
                        />
                        <div className="flex items-center justify-between mt-6 px-2">
                            <p className="text-white text-2xl font-bold tracking-tight">{selectedCam.name}</p>
                            <button className="text-slate-400 hover:text-white transition-colors text-sm font-medium bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
                                {t('cameras.close', 'Close [Esc]')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

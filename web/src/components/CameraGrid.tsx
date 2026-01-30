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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CAMERAS.map((cam) => (
                    <button
                        key={cam.id}
                        onClick={() => setSelectedCam(cam)}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-colors bg-black"
                    >
                        <img
                            src={`${cam.url}?t=${timestamp}`}
                            alt={cam.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <span className="text-sm font-medium text-white">{cam.name}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Modal */}
            {selectedCam && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setSelectedCam(null)}
                >
                    <div className="max-w-5xl w-full relative">
                        <img
                            src={`${selectedCam.url}?t=${timestamp}`}
                            alt={selectedCam.name}
                            className="w-full rounded-lg shadow-2xl border border-slate-800"
                        />
                        <p className="text-center text-white mt-4 text-xl font-semibold">{selectedCam.name}</p>
                        <button className="absolute -top-12 right-0 text-white hover:text-red-400 text-lg">Close [Esc]</button>
                    </div>
                </div>
            )}
        </section>
    );
};

const AURORA_DATA =
  'https://cdn.fmi.fi/weather-observations/products/magnetic-disturbance-observations/map-latest-fi.png';
const INFO_URL = 'https://www.ilmatieteenlaitos.fi/revontulet-ja-avaruussaa';

interface AuroraMapProps {
  timestamp: number;
}

export const AuroraMap = ({ timestamp }: AuroraMapProps) => {
  return (
    <section className="bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800/50">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <span className="w-2 h-8 bg-green-500 rounded-full"></span>
        Magneettiset Häiriöt
      </h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative group rounded-xl overflow-hidden shadow-2xl bg-black">
          <img
            src={`${AURORA_DATA}?t=${timestamp}`}
            alt="Aurora Data"
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Kartta näyttää magneettikentän hetkelliset häiriöt Suomen alueella. Mitä punaisempi
            väri, sitä suurempi todennäköisyys revontulille.
          </p>
          <a
            href={INFO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors"
          >
            Avaa FMI:n palvelu
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

import { useTranslation } from 'react-i18next';

import { useSolarActivity } from '../hooks/useSolarActivity';
import { getAuroraVerdict } from '../utils/auroraVerdict';

const STYLES = {
  go: 'border-aurora-teal text-aurora-teal',
  maybe: 'border-yellow-300 text-yellow-300',
  nogo: 'border-white/30 text-white/60',
} as const;

interface AuroraVerdictProps {
  onNavigate?: (section: 'map' | 'graphs' | 'observatory_status') => void;
  compact?: boolean;
}

export const AuroraVerdict = ({ onNavigate, compact = false }: AuroraVerdictProps) => {
  const { t } = useTranslation();
  const { data, loading, error } = useSolarActivity();

  if (!data) {
    return (
      <section className="neo-panel p-5 font-mono text-sm text-white/60" aria-live="polite">
        {loading ? t('status.loading') : error ? t('status.unavailable') : t('status.unknown')}
      </section>
    );
  }

  const { level, score } = getAuroraVerdict(data.kp, data.bz, data.speed);

  return (
    <section
      className={`neo-panel border-2 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 ${STYLES[level]}`}
      aria-labelledby="aurora-verdict-title"
    >
      <div className="flex-1">
        <p className="font-mono text-xs uppercase tracking-widest text-white/65">
          {t('verdict.label')}
        </p>
        <h2
          id="aurora-verdict-title"
          className="text-3xl md:text-4xl font-sans font-extrabold uppercase"
        >
          {t(`verdict.${level}`)}
        </h2>
        <p className="mt-1 text-sm text-white/70">{t(`verdict.${level}_desc`)}</p>
        <p className="mt-2 font-mono text-xs text-white/65">
          {t('status.kp')} {data.kp.toFixed(1)} · {t('status.bz')} {data.bz.toFixed(1)} nT ·{' '}
          {Math.round(data.speed)} km/s{error ? ` · ${t('status.stale')}` : ''}
        </p>
      </div>
      <div className="text-right">
        <div className="text-5xl font-sans font-extrabold">{score}%</div>
        <div className={`mt-3 flex-wrap justify-end gap-2 ${compact ? 'hidden' : 'flex'}`}>
          {(['observatory_status', 'graphs', 'map'] as const).map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => onNavigate?.(section)}
              className="border-2 border-white/40 px-3 py-1 font-mono text-xs uppercase text-white hover:bg-white hover:text-black"
            >
              {t(`verdict.go_to_${section}`)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

import { useTranslation } from 'react-i18next';

interface DataStatusProps {
  source: string;
  state: 'error' | 'empty';
  onRetry: () => void;
  lastUpdated?: number | null;
}

export const DataStatus = ({ source, state, onRetry, lastUpdated }: DataStatusProps) => {
  const { t, i18n } = useTranslation();
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${state === 'error' ? 'border-amber-300/20 bg-amber-300/[0.06]' : 'border-white/10 bg-white/[0.025]'}`}
      role={state === 'error' ? 'alert' : 'status'}
    >
      <p className="text-sm text-white/70">
        {state === 'error' ? t('data_state.error', { source }) : t('data_state.empty', { source })}
      </p>
      {lastUpdated ? (
        <p className="mt-1 font-mono text-xs text-white/40">
          {t('data_state.lastUpdated', {
            time: new Intl.DateTimeFormat(i18n.language, {
              dateStyle: 'short',
              timeStyle: 'medium',
            }).format(lastUpdated),
          })}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-xs text-aurora-teal transition hover:border-aurora-teal/40"
      >
        {t('data_state.retry')}
      </button>
    </div>
  );
};

export const DataFreshness = ({ source, lastUpdated }: { source: string; lastUpdated: number }) => {
  const { t, i18n } = useTranslation();
  return (
    <p className="text-center font-mono text-[10px] text-white/35">
      {t('data_state.sourceUpdated', {
        source,
        time: new Intl.DateTimeFormat(i18n.language, {
          dateStyle: 'short',
          timeStyle: 'medium',
        }).format(lastUpdated),
      })}
    </p>
  );
};

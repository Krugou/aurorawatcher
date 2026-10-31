import { useTranslation } from 'react-i18next';

import { NightTimeline as Timeline, VerdictLevel } from '../utils/verdict';

const BAR_COLORS: Record<VerdictLevel, string> = {
  go: 'bg-aurora-teal',
  maybe: 'bg-aurora-blue',
  wait: 'bg-aurora-violet/70',
  nogo: 'bg-white/25',
  daylight: 'bg-amber-400/30',
};

const formatHour = (time: number) =>
  new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const NightTimeline = ({ timeline }: { timeline: Timeline }) => {
  const { t } = useTranslation();
  const { slots, best } = timeline;

  return (
    <section className="space-y-3" aria-labelledby="best-time-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4
          id="best-time-title"
          className="text-sm font-mono font-medium uppercase tracking-widest text-white/60"
        >
          {t('verdict.best.title')}
        </h4>
        <p className="font-sans font-bold text-aurora-teal" data-testid="best-window">
          {best
            ? t('verdict.best.window', { start: formatHour(best.start), end: formatHour(best.end) })
            : t('verdict.best.none')}
        </p>
      </div>

      <ol className="flex items-end gap-1 h-20" aria-label={t('verdict.best.title')}>
        {slots.map((slot) => {
          const inBest = best !== null && slot.time >= best.start && slot.time < best.end;
          const height = Math.max(8, slot.verdict.score);
          const label = t('verdict.best.slot', {
            time: formatHour(slot.time),
            level: t(`verdict.level.${slot.verdict.level}`),
            percent: slot.verdict.score,
          });
          return (
            <li key={slot.time} className="flex-1 h-full flex items-end" title={label}>
              <span className="sr-only">{label}</span>
              <span
                aria-hidden="true"
                className={`block w-full rounded-t ${BAR_COLORS[slot.verdict.level]} ${
                  inBest ? 'ring-2 ring-white/70' : ''
                }`}
                style={{ height: `${height}%` }}
              />
            </li>
          );
        })}
      </ol>
      <div className="flex justify-between text-[10px] font-mono text-white/60" aria-hidden="true">
        <span>{formatHour(slots[0].time)}</span>
        <span>{formatHour(slots[Math.floor(slots.length / 2)].time)}</span>
        <span>{formatHour(slots[slots.length - 1].time)}</span>
      </div>
      <p className="text-[11px] font-mono text-white/60">{t('verdict.best.note')}</p>
    </section>
  );
};

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Trend } from '../utils/disturbance';
import { renderShareCardBlob, shareOrDownloadCard } from '../utils/shareCard';
import { NightTimeline as Timeline, Verdict, VerdictLevel } from '../utils/verdict';
import { NightTimeline } from './NightTimeline';

interface VerdictCardProps {
  verdict: Verdict;
  timeline: Timeline | null;
  trend: Trend | null;
  trendStation?: string;
  /** Label for the shared image, usually the nearest station. */
  place: string;
}

const LEVEL_STYLE: Record<
  VerdictLevel,
  { icon: string; bg: string; border: string; text: string; bar: string }
> = {
  go: {
    icon: '🌌',
    bg: 'bg-aurora-teal/10',
    border: 'border-aurora-teal/30',
    text: 'text-aurora-teal',
    bar: 'bg-aurora-teal',
  },
  maybe: {
    icon: '✨',
    bg: 'bg-aurora-blue/10',
    border: 'border-aurora-blue/30',
    text: 'text-aurora-blue',
    bar: 'bg-aurora-blue',
  },
  wait: {
    icon: '⏳',
    bg: 'bg-aurora-violet/10',
    border: 'border-aurora-violet/30',
    text: 'text-aurora-violet',
    bar: 'bg-aurora-violet',
  },
  nogo: {
    icon: '☁️',
    bg: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-white/60',
    bar: 'bg-white/60',
  },
  daylight: {
    icon: '☀️',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    bar: 'bg-amber-400',
  },
};

const TREND_ICON: Record<Trend, string> = { rising: '↗', falling: '↘', steady: '→' };

export const VerdictCard = ({
  verdict,
  timeline,
  trend,
  trendStation,
  place,
}: VerdictCardProps) => {
  const { t } = useTranslation();
  const [shareState, setShareState] = useState<
    'idle' | 'busy' | 'shared' | 'downloaded' | 'failed'
  >('idle');
  const style = LEVEL_STYLE[verdict.level];
  const levelLabel = t(`verdict.level.${verdict.level}`);
  const reason = t(`verdict.reason.${verdict.limiting}`);
  const odds = t('verdict.odds', { percent: verdict.score });

  const factors = [
    { key: 'darkness', value: verdict.factors.darkness },
    { key: 'cloud', value: verdict.factors.cloud },
    { key: 'moon', value: verdict.factors.moon },
    { key: 'activity', value: verdict.activity },
  ] as const;

  const share = async () => {
    setShareState('busy');
    try {
      const blob = await renderShareCardBlob({
        level: verdict.level,
        heading: t('verdict.share.heading'),
        verdict: levelLabel,
        odds: `${verdict.score}%`,
        reason,
        place,
        factors: factors.map((f) => ({ label: t(`verdict.factors.${f.key}`), value: f.value })),
        footer: window.location.host + window.location.pathname,
      });
      const result = await shareOrDownloadCard(
        blob,
        t('verdict.share.text', { level: levelLabel, percent: verdict.score }),
      );
      setShareState(result === 'cancelled' ? 'idle' : result);
    } catch {
      setShareState('failed');
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl border ${style.border} ${style.bg} space-y-5 transition-all duration-500`}
      data-testid="verdict-card"
      data-level={verdict.level}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-3xl" aria-hidden="true">
            {style.icon}
          </span>
          <div className="min-w-0">
            <h4 className={`font-sans font-bold text-lg leading-tight ${style.text}`}>
              {levelLabel}
            </h4>
            <p className="text-xs font-mono text-white/50 mt-0.5">{reason}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-sans font-bold text-white">{verdict.score}%</div>
          <p className="text-[10px] font-mono text-white/60 uppercase tracking-tighter">{odds}</p>
        </div>
      </div>

      <div
        className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={verdict.score}
        aria-label={odds}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${style.bar}`}
          style={{ width: `${verdict.score}%` }}
        />
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-2" aria-label={t('verdict.factors.title')}>
        {factors.map((factor) => (
          <li
            key={factor.key}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono"
          >
            <p className="text-[10px] uppercase tracking-widest text-white/60">
              {t(`verdict.factors.${factor.key}`)}
            </p>
            <p className="text-sm text-white/90">{Math.round(factor.value * 100)}%</p>
          </li>
        ))}
      </ul>

      <p className="text-xs font-mono text-white/60" data-testid="trend">
        {trend ? (
          <>
            <span aria-hidden="true">{TREND_ICON[trend]} </span>
            {t(`verdict.trend.${trend}`)}
            {trendStation && (
              <span className="text-white/60">
                {' · '}
                {t('verdict.trend.hint', { station: trendStation })}
              </span>
            )}
          </>
        ) : (
          <span className="text-white/60">{t('verdict.trend.unknown')}</span>
        )}
      </p>

      {timeline && <NightTimeline timeline={timeline} />}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void share()}
          disabled={shareState === 'busy'}
          className="rounded-lg border border-white/15 px-4 py-2 font-mono text-xs text-aurora-teal transition hover:border-aurora-teal/40 disabled:opacity-50"
        >
          {t('verdict.share.button')}
        </button>
        <p role="status" className="text-xs font-mono text-white/50">
          {shareState === 'shared' && t('verdict.share.shared')}
          {shareState === 'downloaded' && t('verdict.share.saved')}
          {shareState === 'failed' && t('verdict.share.failed')}
        </p>
      </div>
    </div>
  );
};

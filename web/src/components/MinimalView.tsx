import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useImageMetadata } from '../hooks/useImageMetadata';
import { useSolarActivity } from '../hooks/useSolarActivity';
import { useStationStatuses } from '../hooks/useStationStatuses';
import { Location } from '../types';
import { Analytics } from '../utils/analytics';
import { getAuroraVerdict } from '../utils/auroraVerdict';
import { normalizeStationKey } from '../utils/i18nUtils';
import { AuroraVerdict } from './AuroraVerdict';

interface MinimalCardProps {
  loc: Location;
  timestamp: number;
}

const MinimalCard = ({ loc, timestamp }: MinimalCardProps) => {
  const { t } = useTranslation();
  const lastModified = useImageMetadata(loc.image, timestamp);

  return (
    <div className="relative w-full rounded-xl border border-white/10 overflow-hidden group mb-2">
      <img
        src={`${loc.image}?t=${timestamp}`}
        alt={loc.name}
        className="w-full h-auto block grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
        loading="lazy"
      />
      <div className="absolute top-2 left-2 flex gap-2">
        <span className="bg-aurora-teal/80 text-black font-mono font-bold text-xs px-2 py-0.5 rounded-md uppercase">
          {t(loc.name)}
        </span>
        {lastModified && (
          <span className="bg-black/60 backdrop-blur-sm text-white/80 font-mono text-xs px-2 py-0.5 rounded-md border border-white/10">
            {lastModified}
          </span>
        )}
      </div>
    </div>
  );
};

interface MinimalViewProps {
  locations: Record<string, Location>;
  timestamp: number;
  onBack?: () => void;
}

const STATUS_STYLES = {
  HIGH: 'border-red-400 text-red-300',
  MODERATE: 'border-yellow-300 text-yellow-200',
} as const;

export const MinimalView = ({ locations, timestamp, onBack }: MinimalViewProps) => {
  const { t } = useTranslation();
  const { data } = useSolarActivity();
  const { statuses } = useStationStatuses(timestamp);
  const [forceCams, setForceCams] = useState(false);

  const level = data ? getAuroraVerdict(data.kp, data.bz, data.speed).level : 'nogo';
  const active = statuses
    .filter((s) => s.status === 'HIGH' || s.status === 'MODERATE')
    .sort((a, b) => (a.status === b.status ? 0 : a.status === 'HIGH' ? -1 : 1));
  const isActive = level !== 'nogo' || active.length > 0;
  const showCams = isActive || forceCams;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 flex flex-col gap-4 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => {
          Analytics.trackNavigation('back_from_minimal');
          onBack?.();
        }}
        className="fixed bottom-4 right-4 z-50 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full font-mono text-xs uppercase hover:bg-white/20 transition-all duration-300"
      >
        {t('minimal.back')}
      </button>

      <AuroraVerdict compact />

      <section aria-label={t('minimal.active_stations')} className="space-y-2">
        <h2 className="font-mono text-xs uppercase tracking-widest text-white/65">
          {t('minimal.active_stations')}
        </h2>
        {active.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {active.map((s) => (
              <li
                key={s.name}
                className={`border-2 px-3 py-1 font-mono text-xs uppercase ${STATUS_STYLES[s.status as 'HIGH' | 'MODERATE']}`}
              >
                {t(`common.loc.${normalizeStationKey(s.name)}`)} ·{' '}
                {t(`status.${s.status.toLowerCase()}`)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-sm text-white/65">{t('minimal.quiet')}</p>
        )}
      </section>

      {showCams ? (
        Object.entries(locations).map(([key, loc]) => (
          <MinimalCard key={key} loc={loc} timestamp={timestamp} />
        ))
      ) : (
        <button
          type="button"
          onClick={() => {
            setForceCams(true);
          }}
          className="border-2 border-white/30 px-4 py-3 font-mono text-xs uppercase text-white/80 hover:bg-white hover:text-black"
        >
          {t('minimal.show_cams')}
        </button>
      )}
    </div>
  );
};

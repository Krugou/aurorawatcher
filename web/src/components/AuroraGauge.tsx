import { useTranslation } from 'react-i18next';

interface AuroraGaugeProps {
  cloudCover: number; // 0-8 octas
  kp: number; // 0-9
  bz: number; // nT
  isTooBright?: boolean;
}

export const AuroraGauge = ({ cloudCover, kp, bz, isTooBright }: AuroraGaugeProps) => {
  const { t } = useTranslation();

  // Calculate score (0-100)
  let score = 0;

  // Cloud Penalty (Heavy)
  // 0-2: Perfect (100%), 3-4: Okay (50%), 5-6: Bad (20%), 7-8: Terrible (0%)
  const cloudScore = cloudCover <= 2 ? 100 : cloudCover <= 4 ? 60 : cloudCover <= 6 ? 20 : 0;

  // Solar Score (Kp + Bz)
  // simple heuristic: Kp * 10 + (Bz < 0 ? -Bz * 5 : 0)
  // Max Kp9 ~ 90, Bz-10 ~ 50 -> Cap at 100
  const solarScore = Math.min(100, kp * 10 + (bz < 0 ? Math.abs(bz) * 5 : 0));

  // Final score is mostly limited by clouds
  // If clouds are bad, score is capped low regardless of solar activity
  score = (cloudScore * solarScore) / 100;

  // Enhance score logic for edge cases
  if (cloudCover >= 7) score = 0; // Overcast = No Go
  if (cloudCover <= 1 && solarScore > 50) score = Math.max(score, 80); // Clear sky + decent activity = GO
  if (isTooBright) score = 0; // Too bright to see regardless of score

  // Determine Color & Text
  let color = 'text-white/65';
  let gaugeColor = 'bg-white/20';
  let label = t('status.quiet'); // Default text key, should be customized

  if (isTooBright) {
    color = 'text-amber-400';
    gaugeColor = 'bg-amber-400';
    label = t('local.daytime_title');
  } else if (score >= 80) {
    color = 'text-aurora-teal';
    gaugeColor = 'bg-aurora-teal';
    label = t('gauge.go');
  } else if (score >= 50) {
    color = 'text-amber-400';
    gaugeColor = 'bg-amber-400';
    label = t('gauge.possible');
  } else if (score >= 20) {
    color = 'text-aurora-rose';
    gaugeColor = 'bg-aurora-rose';
    label = t('gauge.maybe');
  } else {
    color = 'text-red-400';
    gaugeColor = 'bg-red-400';
    label = t('gauge.nope');
  }

  // Angle for gauge needle (-90 to 90)
  const angle = -90 + (score / 100) * 180;

  return (
    <div className="flex flex-col items-center justify-center p-4 relative w-full h-full min-h-[160px]">
      {/* Semi-Circle Gauge Background */}
      <div className="relative w-48 h-24 overflow-hidden mb-2">
        <div
          className="w-48 h-48 rounded-full border-white/10 box-border absolute top-0 left-0"
          style={{ borderWidth: '10px' }}
        />
        {/* Colored Arc */}
        <div
          className={`w-48 h-48 rounded-full ${score >= 80 ? 'border-aurora-teal' : score >= 50 ? 'border-amber-400' : 'border-red-400'} absolute top-0 opacity-20`}
          style={{ borderWidth: '10px' }}
        />
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-0.5 h-[5.5rem] bg-white/80 origin-bottom transition-transform duration-1000 ease-out z-10"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        >
          <div
            className={`w-3 h-3 rounded-full ${gaugeColor} absolute -top-1 left-1/2 -translate-x-1/2`}
          />
        </div>
      </div>

      <div className="text-center z-20 mt-4">
        <h3 className={`text-2xl font-sans font-bold ${color}`}>{label}</h3>
        <p className="text-xs font-mono font-medium text-white/65 mt-1 uppercase tracking-widest">
          {t('gauge.odds')}: {Math.round(score)}%
        </p>
      </div>

      {/* Stats Mini */}
      <div className="flex gap-4 mt-2 text-[10px] font-mono text-white/65">
        <span title={t('gauge.cloud_cover')}>☁️ {Math.round((cloudCover / 8) * 100)}%</span>
        <span title={t('gauge.solar_activity')}>🌌 {Math.round(solarScore)}%</span>
      </div>
    </div>
  );
};

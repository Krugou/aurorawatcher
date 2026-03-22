import { useTranslation } from 'react-i18next';
import { getViewingProbability, VisibilityStatus } from '../utils/daylight';

interface VisibilityDashboardProps {
  lat: number;
  lon: number;
  cloudCover: number;
  magneticStatus: 'HIGH' | 'MODERATE' | 'LOW' | 'QUIET' | 'UNKNOWN';
}

export const VisibilityDashboard = ({
  lat,
  lon,
  cloudCover,
  magneticStatus,
}: VisibilityDashboardProps) => {
  const { t } = useTranslation();
  const report = getViewingProbability(lat, lon, cloudCover, magneticStatus);

  const getStatusConfig = (status: VisibilityStatus) => {
    switch (status) {
      case VisibilityStatus.DAYLIGHT:
        return {
          icon: '☀️',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          label: t('local.daytime_title'),
        };
      case VisibilityStatus.CLOUDY:
        return {
          icon: '☁️',
          bg: 'bg-white/5',
          border: 'border-white/10',
          text: 'text-white/60',
          label: t('local.noGo'),
        };
      case VisibilityStatus.OPTIMAL:
        return {
          icon: '🌌',
          bg: 'bg-aurora-teal/10',
          border: 'border-aurora-teal/30',
          text: 'text-aurora-teal',
          label: t('local.go'),
        };
      case VisibilityStatus.CLEAR:
      default:
        return {
          icon: '✨',
          bg: 'bg-aurora-blue/10',
          border: 'border-aurora-blue/30',
          text: 'text-aurora-blue',
          label: t('local.go1'),
        };
    }
  };

  const config = getStatusConfig(report.status);

  return (
    <div
      className={`mt-6 p-5 rounded-2xl border ${config.border} ${config.bg} transition-all duration-500`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h4 className={`font-sans font-bold text-lg leading-tight ${config.text}`}>
              {config.label}
            </h4>
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest mt-0.5">
              {t(report.statusMessage)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-sans font-bold text-white">{report.probability}%</div>
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-tighter">
            {t('local.visibility')}
          </p>
        </div>
      </div>

      {/* Probability Bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-out rounded-full ${
            report.status === VisibilityStatus.OPTIMAL
              ? 'bg-aurora-teal'
              : report.status === VisibilityStatus.DAYLIGHT
                ? 'bg-amber-400'
                : 'bg-aurora-blue'
          }`}
          style={{ width: `${report.probability}%` }}
        />
      </div>

      {report.status === VisibilityStatus.DAYLIGHT && (
        <p className="mt-3 text-xs font-mono text-amber-400/60 leading-relaxed italic">
          {t('local.daytime_desc')}
        </p>
      )}
    </div>
  );
};

import { useTranslation } from 'react-i18next';

import { Location } from '../types';
import { ObservatoryCard } from './ObservatoryCard';

interface ObservatoryGridProps {
  locations: Record<string, Location>;
  timestamp: number;
}

export const ObservatoryGrid = ({ locations, timestamp }: ObservatoryGridProps) => {
  const { t } = useTranslation();
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 px-2 text-slate-900 dark:text-white transition-colors">
        <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
        {t('grid.title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {Object.entries(locations).map(([key, loc]) => (
          <ObservatoryCard key={key} id={key} loc={loc} timestamp={timestamp} />
        ))}
      </div>
    </section>
  );
};

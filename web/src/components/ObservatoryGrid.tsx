import { Location } from '../types';
import { ObservatoryCard } from './ObservatoryCard';

interface ObservatoryGridProps {
  locations: Record<string, Location>;
  timestamp: number;
}

export const ObservatoryGrid = ({ locations, timestamp }: ObservatoryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {Object.entries(locations).map(([key, loc]) => (
        <ObservatoryCard key={key} id={key} loc={loc} timestamp={timestamp} />
      ))}
    </div>
  );
};

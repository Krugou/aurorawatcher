import { useTranslation } from 'react-i18next';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  const { t } = useTranslation();
  return (
    <div
      className={`bg-white/5 animate-pulse rounded-xl ${className}`}
      role="status"
      aria-label={t('grid.loading')}
    />
  );
};

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={`bg-slate-800 animate-pulse rounded-lg ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
};

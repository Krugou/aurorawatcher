interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-zinc-800 animate-pulse border-2 border-dashed border-gray-400 dark:border-gray-600 ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
};

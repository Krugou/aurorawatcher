export interface TouchPoint {
  x: number;
  y: number;
}

export type SwipeDirection = 'next' | 'previous';

export const getSwipeDirection = (
  start: TouchPoint,
  end: TouchPoint,
  threshold = 60,
): SwipeDirection | null => {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return null;
  return deltaX < 0 ? 'next' : 'previous';
};

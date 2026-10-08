import { describe, expect, it } from 'vitest';

import { getSwipeDirection } from '../../utils/swipe';

describe('getSwipeDirection', () => {
  it('maps left swipes to next and right swipes to previous', () => {
    expect(getSwipeDirection({ x: 200, y: 40 }, { x: 120, y: 45 })).toBe('next');
    expect(getSwipeDirection({ x: 120, y: 45 }, { x: 200, y: 40 })).toBe('previous');
  });

  it('ignores short and mostly vertical gestures', () => {
    expect(getSwipeDirection({ x: 100, y: 100 }, { x: 150, y: 100 })).toBeNull();
    expect(getSwipeDirection({ x: 100, y: 100 }, { x: 180, y: 220 })).toBeNull();
  });
});

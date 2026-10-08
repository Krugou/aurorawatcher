import { describe, expect, it } from 'vitest';

import { rankAuroraGallery } from '../../utils/auroraGalleryRanking';

const entry = (camId: string, greenPixels: number, score: number, timestamp = 1) => ({
  camId,
  timestamp,
  score,
  greenPixels,
  purplePixels: 0,
  redPixels: 0,
});

describe('rankAuroraGallery', () => {
  it('ranks by total aurora-colored pixels, then score and recency', () => {
    expect(
      rankAuroraGallery([
        entry('score-tiebreak', 8, 80),
        entry('most-pixels', 12, 20),
        entry('score-tiebreak-lower', 8, 70),
        entry('recent-tiebreak', 8, 80, 2),
      ]).map((item) => item.camId),
    ).toEqual(['most-pixels', 'recent-tiebreak', 'score-tiebreak', 'score-tiebreak-lower']);
  });

  it('returns a new array and limits the saved best matches', () => {
    const input = [entry('weaker', 2, 10), entry('stronger', 9, 20)];
    const ranked = rankAuroraGallery(input, 1);
    expect(ranked.map((item) => item.camId)).toEqual(['stronger']);
    expect(ranked).not.toBe(input);
    expect(input[0].camId).toBe('weaker');
  });
});

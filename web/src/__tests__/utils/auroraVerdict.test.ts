import { describe, expect, it } from 'vitest';

import { getAuroraVerdict } from '../../utils/auroraVerdict';

describe('getAuroraVerdict', () => {
  it('returns nogo for quiet conditions', () => {
    expect(getAuroraVerdict(1, 2, 350).level).toBe('nogo');
  });

  it('returns maybe for moderate activity', () => {
    expect(getAuroraVerdict(3, -3, 400).level).toBe('maybe');
  });

  it('returns go for storm conditions and clamps the score', () => {
    const verdict = getAuroraVerdict(8, -20, 900);
    expect(verdict.level).toBe('go');
    expect(verdict.score).toBe(100);
  });
});

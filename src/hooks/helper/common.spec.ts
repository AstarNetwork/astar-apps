import { describe, expect, it } from '@jest/globals';
import { truncate } from './common';

describe('Test functions that are defined in common.ts', () => {
  it('truncate numbers', () => {
    expect(truncate(3.5636232, 2)).toBe(3.56);
    expect(truncate(3.5636232, 3)).toBe(3.563);
    expect(truncate(0.9899, 3)).toBe(0.989);
    expect(truncate(0.9899)).toBe(0.989);
    expect(truncate('0.9899')).toBe(0.989);
    expect(truncate('0.12')).toBe(0.12);
    expect(truncate('0.001')).toBe(0.001);
    expect(truncate('0.00001')).toBe(0);
  });
});

import { describe, expect, it } from '@jest/globals';
import { formatTip } from './index';

describe('Test Gas-Api utils', () => {
  it('convert the native tip amount from wei', () => {
    // Memo: toBe -> unit: ASTR(same as ETH)
    expect(formatTip(10000000000000)).toBe('0.00001');
  });
});

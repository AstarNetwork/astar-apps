import { describe, expect, it } from '@jest/globals';
import { priorityFeeToTip } from './index';

describe('Test Gas-Api utils', () => {
  it('calculate native tip amount from eip1559 priorityFeePerGas', () => {
    expect(priorityFeeToTip(223353420029)).toBe('0.000223353420029');
    expect(priorityFeeToTip(115000000)).toBe('0.000000115');
  });
});

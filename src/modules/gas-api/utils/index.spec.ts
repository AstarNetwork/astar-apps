import { describe, expect, it } from '@jest/globals';
import { priorityFeeToTips } from '.';

describe('Test Gas-Api utils', () => {
  it('calculate native tips amount from eip1559 priorityFeePerGas', () => {
    expect(priorityFeeToTips(223353420029)).toBe('0.000223353420029');
    expect(priorityFeeToTips(115000000)).toBe('0.000000115');
  });
});

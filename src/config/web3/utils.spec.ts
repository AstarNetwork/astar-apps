import { isXc20Token } from './utils/index';
import { describe, expect, it } from '@jest/globals';
describe('Test web3 utils', () => {
  it('test `isXc20Token` function', () => {
    expect(isXc20Token('0x19574c3c8FaFc875051b665Ec131b7E60773d2C9')).toBe(false);
    expect(isXc20Token('0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF')).toBe(true);
  });
});

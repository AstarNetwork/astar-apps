import { describe, expect, it } from '@jest/globals';
import { BN } from '@polkadot/util';
import { Guard } from 'src/v2/common';

describe('Guard.ts', () => {
  it('throws error if paramName is not provided', () => {
    const call = () => Guard.ThrowIfUndefined('', 5);

    expect(call).toThrow('Invalid argument paramName');
  });

  it('throws error if paramValue is not provided', () => {
    const call = () => Guard.ThrowIfUndefined('param', undefined);
    const call2 = () => Guard.ThrowIfUndefined('param', null);
    const call3 = () => Guard.ThrowIfUndefined('param', '');

    expect(call).toThrow('Invalid argument param');
    expect(call2).toThrow('Invalid argument param');
    expect(call3).toThrow('Invalid argument param');
  });

  it('throws error if paramValue is negative', () => {
    const call = () => Guard.ThrowIfNegative('param', new BN(-1));
    const call2 = () => Guard.ThrowIfNegative('param', -1);

    expect(call).toThrow('Invalid argument param');
    expect(call2).toThrow('Invalid argument param');
  });
});

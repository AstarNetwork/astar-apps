import { describe, expect, it } from '@jest/globals';
import { Chain } from 'src/modules/xcm/index';
import { checkIsFromRelayChain } from './index';

// Todo: fix test environment error
describe('Test functions that are defined in xcm/utils/index.ts', () => {
  it('Check whether `from chain` is the relaychain', () => {
    expect(checkIsFromRelayChain(Chain.Polkadot)).toBe(true);
    expect(checkIsFromRelayChain(Chain.Kusama)).toBe(true);
    expect(checkIsFromRelayChain(Chain.Astar)).toBe(false);
    expect(checkIsFromRelayChain(Chain.Shiden)).toBe(false);
  });
});

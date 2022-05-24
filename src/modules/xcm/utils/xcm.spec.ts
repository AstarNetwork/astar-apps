import { describe, expect, it } from '@jest/globals';
import { Chain } from 'src/modules/xcm/index';
import { isFromRelayChain } from './index';

// Todo: fix test environment error
describe('Test functions that are defined in xcm/utils/index.ts', () => {
  it('Check whether `from chain` is the relaychain', () => {
    expect(isFromRelayChain(Chain.Polkadot)).toBe(true);
    expect(isFromRelayChain(Chain.Kusama)).toBe(true);
    expect(isFromRelayChain(Chain.Astar)).toBe(false);
    expect(isFromRelayChain(Chain.Shiden)).toBe(false);
  });
});

import { u8aToHex } from '@polkadot/util';
import { addressToEvm, decodeAddress } from '@polkadot/util-crypto';

const ASTAR_SS58_FORMAT = 5;

export function getShortenAddress(address: string): string {
  return address ? `${address.slice(0, 6)}${'.'.repeat(6)}${address.slice(-6)}` : '';
}

// Memo: The EVM address won't be same as the address shown in MetaMask imported from the same private key of the SS58
// Ref: https://github.com/polkadot-js/common/issues/931
export const toEvmAddress = (ss58Address: string) => {
  return u8aToHex(addressToEvm(ss58Address));
};

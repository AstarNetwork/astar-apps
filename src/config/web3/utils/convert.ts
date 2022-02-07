import Web3 from 'web3';
import { u8aToHex } from '@polkadot/util';
import { addressToEvm, evmToAddress } from '@polkadot/util-crypto';
import { ASTAR_SS58_FORMAT } from 'src/hooks/helper/plasmUtils';

// Memo: The EVM address won't be same as the address shown in MetaMask imported from the same private key of the SS58
// Ref: https://github.com/polkadot-js/common/issues/931
export const toEvmAddress = (ss58Address: string) => {
  return u8aToHex(addressToEvm(ss58Address));
};

export const checkSumEvmAddress = (evmAddress: string): string => {
  const web3 = new Web3();
  return web3.utils.toChecksumAddress(evmAddress);
};

export const isValidEvmAddress = (evmAddress: string): boolean => {
  if (!evmAddress) return false;

  try {
    const web3 = new Web3();
    // Memo: returns `false` if evmAddress was converted from SS58
    const isEvmAddress = web3.utils.checkAddressChecksum(evmAddress);

    // Memo: check if the given evmAddress is convertible
    const ss58Address = toSS58Address(evmAddress);

    return ss58Address.length > 0 || isEvmAddress;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const toSS58Address = (h160Address: string) => {
  const address = checkSumEvmAddress(h160Address);
  return evmToAddress(address, ASTAR_SS58_FORMAT);
};

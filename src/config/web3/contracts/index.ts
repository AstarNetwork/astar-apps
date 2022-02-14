import Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import type { Contract } from 'web3-eth-contract/types';
export { Staking } from './staking';
export const DEFAULT_GAS_PRICE = '20000000000';

export const contractInstance = (
  web3: Web3,
  abiJson: Object,
  callAddress: string,
  fromAddress: string,
  gasPrice: string = DEFAULT_GAS_PRICE
): Contract => {
  return new web3.eth.Contract(abiJson as AbiItem[], callAddress, {
    from: fromAddress,
    gasPrice,
  });
};

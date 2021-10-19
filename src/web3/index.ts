import { endpointKey } from './../config/chainEndpoints';
export { getChainData, setupNetwork, getChainId, createWeb3Instance } from './utils';

/*
 * EVM network config
 * Metamask address format: H160
 */

export type TNetworkId = endpointKey.SHIDEN | endpointKey.SHIBUYA;

export enum EVM {
  SHIDEN_MAINNET = 336,
  SHIDEN_TESTNET = 81,
}

export const chainName = {
  [EVM.SHIDEN_MAINNET]: 'Shiden Network Mainnet',
  [EVM.SHIDEN_TESTNET]: 'Shibuya Testnet',
};

export const nativeCurrency = {
  [EVM.SHIDEN_MAINNET]: {
    name: 'SDN',
    symbol: 'sdn',
    decimals: 18,
  },
  [EVM.SHIDEN_TESTNET]: {
    name: 'SBY',
    symbol: 'sby',
    decimals: 18,
  },
};

export const rpcUrls = {
  [EVM.SHIDEN_MAINNET]: ['https://shiden.api.onfinality.io/public'],
  [EVM.SHIDEN_TESTNET]: ['https://rpc.shibuya.astar.network:8545'],
};

export const blockExplorerUrls = {
  [EVM.SHIDEN_MAINNET]: ['https://shiden.subscan.io'],
  [EVM.SHIDEN_TESTNET]: ['https://shibuya.subscan.io'],
};

export const CHAIN_INFORMATION = {
  chainName,
  nativeCurrency,
  rpcUrls,
  blockExplorerUrls,
};

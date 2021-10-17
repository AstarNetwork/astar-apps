export { getChainData, setupNetwork, getChainId, createWeb3Instance } from './utils';

/*
 * EVM network config
 * Metamask address format: H160
 */

export enum CHAIN {
  SHIDEN_MAINNET = 336,
  SHIDEN_TESTNET = 81,
}

export const chainName = {
  [CHAIN.SHIDEN_MAINNET]: 'Shiden Network Mainnet',
  [CHAIN.SHIDEN_TESTNET]: 'Shibuya Testnet',
};

export const nativeCurrency = {
  [CHAIN.SHIDEN_MAINNET]: {
    name: 'SDN',
    symbol: 'sdn',
    decimals: 18,
  },
  [CHAIN.SHIDEN_TESTNET]: {
    name: 'SBY',
    symbol: 'sby',
    decimals: 18,
  },
};

export const rpcUrls = {
  [CHAIN.SHIDEN_MAINNET]: ['https://rpc.shiden.astar.network:8545'],
  [CHAIN.SHIDEN_TESTNET]: ['https://rpc.shibuya.astar.network:8545'],
};

export const blockExplorerUrls = {
  [CHAIN.SHIDEN_MAINNET]: ['https://shiden.subscan.io'],
  [CHAIN.SHIDEN_TESTNET]: ['https://shibuya.subscan.io'],
};

export const CHAIN_INFORMATION = {
  chainName,
  nativeCurrency,
  rpcUrls,
  blockExplorerUrls,
};

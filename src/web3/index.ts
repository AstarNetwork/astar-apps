import { providerEndpoints } from 'src/config/chainEndpoints';
import { endpointKey } from './../config/chainEndpoints';
export { getChainData, setupNetwork, getChainId, createWeb3Instance } from './utils';

export type TNetworkId = endpointKey.SHIDEN | endpointKey.SHIBUYA;

const chain = {
  shiden: providerEndpoints.find((it) => it.key === endpointKey.SHIDEN),
  shibuya: providerEndpoints.find((it) => it.key === endpointKey.SHIBUYA),
};

export enum EVM {
  SHIDEN_MAINNET = Number(chain.shiden!.evmChainId),
  SHIBUYA_TESTNET = Number(chain.shibuya!.evmChainId),
}

export const chainName = {
  [EVM.SHIDEN_MAINNET]: 'Shiden Network Mainnet',
  [EVM.SHIBUYA_TESTNET]: 'Shibuya Testnet',
};

export const nativeCurrency = {
  [EVM.SHIDEN_MAINNET]: {
    name: 'SDN',
    symbol: 'sdn',
    decimals: 18,
  },
  [EVM.SHIBUYA_TESTNET]: {
    name: 'SBY',
    symbol: 'sby',
    decimals: 18,
  },
};

export const rpcUrls = {
  [EVM.SHIDEN_MAINNET]: [chain.shiden?.evmRpc],
  [EVM.SHIBUYA_TESTNET]: [chain.shibuya?.evmRpc],
};

export const blockExplorerUrls = {
  [EVM.SHIDEN_MAINNET]: [chain.shiden?.subscan],
  [EVM.SHIBUYA_TESTNET]: [chain.shibuya?.subscan],
};

export const CHAIN_INFORMATION = {
  chainName,
  nativeCurrency,
  rpcUrls,
  blockExplorerUrls,
};

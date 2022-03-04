import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
export {
  getChainData,
  setupNetwork,
  getChainId,
  createAstarWeb3Instance,
  getTokenBal,
  buildWeb3Instance,
  getTokenExplorer,
  buildEvmAddress,
  getBalance,
  isValidEvmAddress,
  toSS58Address,
  getDefaultEthProvider,
  sendNativeTokenTransaction,
} from './utils';

export { contractInstance, Staking } from './contracts';

export type TNetworkId = endpointKey.SHIDEN | endpointKey.SHIBUYA | endpointKey.ASTAR;

const chain = {
  shiden: providerEndpoints.find((it) => it.key === endpointKey.SHIDEN),
  shibuya: providerEndpoints.find((it) => it.key === endpointKey.SHIBUYA),
  astar: providerEndpoints.find((it) => it.key === endpointKey.ASTAR),
};

export enum EVM {
  SHIDEN_MAINNET = Number(chain.shiden!.evmChainId),
  SHIBUYA_TESTNET = Number(chain.shibuya!.evmChainId),
  ASTAR_MAINNET = Number(chain.astar!.evmChainId),
  ETHEREUM_MAINNET = 1,
  BSC = 56,
  POLYGON = 137,
}

export const chainName = {
  [EVM.ETHEREUM_MAINNET]: 'Ethereum Mainnet',
  [EVM.SHIDEN_MAINNET]: 'Shiden Network Mainnet',
  [EVM.SHIBUYA_TESTNET]: 'Shibuya Testnet',
  [EVM.BSC]: 'Binance Smart Chain',
  [EVM.POLYGON]: 'Polygon Mainnet',
};

export const nativeCurrency = {
  [EVM.ETHEREUM_MAINNET]: {
    name: 'ETH',
    symbol: 'eth',
    decimals: 18,
  },
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
  [EVM.ASTAR_MAINNET]: {
    name: 'ASTR',
    symbol: 'astr',
    decimals: 18,
  },
  [EVM.BSC]: {
    name: 'BNB',
    symbol: 'bnb',
    decimals: 18,
  },
  [EVM.POLYGON]: {
    name: 'MATIC',
    symbol: 'matic',
    decimals: 18,
  },
};

export const rpcUrls = {
  [EVM.ETHEREUM_MAINNET]: ['https://mainnet-nethermind.blockscout.com/'],
  [EVM.SHIDEN_MAINNET]: [chain.shiden?.evmRpc],
  [EVM.SHIBUYA_TESTNET]: [chain.shibuya?.evmRpc],
  [EVM.ASTAR_MAINNET]: [chain.astar?.evmRpc],
  [EVM.BSC]: ['https://bsc-dataseed.binance.org'],
  [EVM.POLYGON]: ['https://rpc-mainnet.maticvigil.com'],
};

export const blockExplorerUrls = {
  [EVM.ETHEREUM_MAINNET]: ['https://etherscan.io'],
  [EVM.SHIDEN_MAINNET]: [chain.shiden?.blockscout],
  [EVM.SHIBUYA_TESTNET]: [chain.shibuya?.blockscout],
  [EVM.ASTAR_MAINNET]: [chain.astar?.blockscout],
  [EVM.BSC]: ['https://bscscan.com'],
  [EVM.POLYGON]: ['https://explorer.matic.network'],
};

export const CHAIN_INFORMATION = {
  chainName,
  nativeCurrency,
  rpcUrls,
  blockExplorerUrls,
};

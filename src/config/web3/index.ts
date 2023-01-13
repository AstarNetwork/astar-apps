import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
export {
  getChainData,
  setupNetwork,
  getChainId,
  createAstarWeb3Instance,
  getTokenBal,
  buildWeb3Instance,
  getTokenExplorer,
  fetchErc20TokenInfo,
  getTokenDetails,
} from 'src/config/web3/utils';

export { contractInstance, Staking } from 'src/config/web3/contracts';

export type TNetworkId = endpointKey.SHIDEN | endpointKey.SHIBUYA | endpointKey.ASTAR;

const chain = {
  shiden: providerEndpoints.find((it) => it.key === endpointKey.SHIDEN),
  shibuya: providerEndpoints.find((it) => it.key === endpointKey.SHIBUYA),
  astar: providerEndpoints.find((it) => it.key === endpointKey.ASTAR),
  localNode: providerEndpoints.find((it) => it.key === endpointKey.LOCAL),
};

export enum EVM {
  SHIDEN_MAINNET = Number(chain.shiden!.evmChainId),
  SHIBUYA_TESTNET = Number(chain.shibuya!.evmChainId),
  ASTAR_MAINNET = Number(chain.astar!.evmChainId),
  ASTAR_LOCAL_NODE = Number(chain.localNode!.evmChainId),
  ETHEREUM_MAINNET = 1,
  BSC = 56,
  POLYGON = 137,
  MOONRIVER = 1285,
  MOONBEAM = 1284,
}

export const chainName = {
  [EVM.ETHEREUM_MAINNET]: 'Ethereum Mainnet',
  [EVM.ASTAR_MAINNET]: 'Astar Network Mainnet',
  [EVM.SHIDEN_MAINNET]: 'Shiden Network Mainnet',
  [EVM.ASTAR_MAINNET]: 'Astar Network Mainnet',
  [EVM.SHIBUYA_TESTNET]: 'Shibuya Testnet',
  [EVM.ASTAR_MAINNET]: 'Astar Network Mainnet',
  [EVM.ASTAR_LOCAL_NODE]: 'Astar Local Node',
  [EVM.BSC]: 'Binance Smart Chain',
  [EVM.POLYGON]: 'Polygon Mainnet',
  [EVM.MOONRIVER]: 'Moonriver Mainnet',
  [EVM.MOONBEAM]: 'Moonbeam Mainnet',
};

export const nativeCurrency = {
  [EVM.ETHEREUM_MAINNET]: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  [EVM.SHIDEN_MAINNET]: {
    name: 'SDN',
    symbol: 'SDN',
    decimals: 18,
  },
  [EVM.SHIBUYA_TESTNET]: {
    name: 'SBY',
    symbol: 'SBY',
    decimals: 18,
  },
  [EVM.ASTAR_MAINNET]: {
    name: 'ASTR',
    symbol: 'ASTR',
    decimals: 18,
  },
  [EVM.ASTAR_LOCAL_NODE]: {
    name: 'LOC',
    symbol: 'LOC',
    decimals: 18,
  },
  [EVM.BSC]: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  [EVM.POLYGON]: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  [EVM.MOONRIVER]: {
    name: 'MOVR',
    symbol: 'MOVR',
    decimals: 18,
  },
  [EVM.MOONBEAM]: {
    name: 'GLMR',
    symbol: 'GLMR',
    decimals: 18,
  },
};

export const rpcUrls = {
  [EVM.ETHEREUM_MAINNET]: ['https://mainnet-nethermind.blockscout.com/'],
  [EVM.SHIDEN_MAINNET]: [chain.shiden?.evmEndpoints[0]],
  [EVM.SHIBUYA_TESTNET]: [chain.shibuya?.evmEndpoints[0]],
  [EVM.ASTAR_MAINNET]: [chain.astar?.evmEndpoints[0]],
  [EVM.ASTAR_LOCAL_NODE]: [chain.localNode?.evmEndpoints[0]],
  [EVM.BSC]: ['https://bsc-dataseed.binance.org'],
  [EVM.POLYGON]: ['https://rpc-mainnet.maticvigil.com'],
  [EVM.MOONRIVER]: ['https://rpc.api.moonriver.moonbeam.network'],
  [EVM.MOONBEAM]: ['https://rpc.api.moonbeam.network'],
};

export const blockExplorerUrls = {
  [EVM.ETHEREUM_MAINNET]: ['https://etherscan.io'],
  [EVM.SHIDEN_MAINNET]: [chain.shiden?.blockscout],
  [EVM.SHIBUYA_TESTNET]: [chain.shibuya?.blockscout],
  [EVM.ASTAR_MAINNET]: [chain.astar?.blockscout],
  [EVM.BSC]: ['https://bscscan.com'],
  [EVM.POLYGON]: ['https://explorer.matic.network'],
  [EVM.MOONRIVER]: ['https://moonriver.moonscan.io'],
  [EVM.MOONBEAM]: ['https://moonbeam.moonscan.io/'],
};

export const CHAIN_INFORMATION = {
  chainName,
  nativeCurrency,
  rpcUrls,
  blockExplorerUrls,
};

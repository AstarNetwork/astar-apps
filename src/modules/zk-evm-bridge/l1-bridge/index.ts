import ABI_ZK_EVM_AGGREGATED_BRIDGE from 'src/config/web3/abi/zkevm-aggregated-bridge-abi.json';
export * from './utils';

export const ZK_EVM_AGGREGATED_BRIDGE_ABI = ABI_ZK_EVM_AGGREGATED_BRIDGE;

export const zkEvmApi = {
  testnet: 'https://zkyoto-bridge-api.astar.network',
  mainnet: 'https://bridge-api.mainnet-astar.com',
};

export enum EthBridgeNetworkName {
  'Sepolia' = 'Sepolia Testnet',
  'Zkyoto' = 'zKyoto Testnet',
  'Ethereum' = 'Ethereum',
  'AstarZk' = 'Astar zkEVM',
}

// Memo: do not import from src/config/web3 due to reference conflicts
export enum ZkChainId {
  'Sepolia' = 11155111,
  'Zkyoto' = 6038361,
  'Ethereum' = 1,
  'AstarZk' = 3776,
}

export const EthBridgeContract = {
  [EthBridgeNetworkName.Sepolia]: '0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582',
  [EthBridgeNetworkName.Ethereum]: '0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe',
  [EthBridgeNetworkName.Zkyoto]: '0x528e26b25a34a4A5d0dbDa1d57D318153d2ED582',
  [EthBridgeNetworkName.AstarZk]: '0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe',
};

export const EthBridgeChainId = {
  [EthBridgeNetworkName.Sepolia]: ZkChainId.Sepolia,
  [EthBridgeNetworkName.Ethereum]: ZkChainId.Ethereum,
  [EthBridgeNetworkName.Zkyoto]: ZkChainId.Zkyoto,
  [EthBridgeNetworkName.AstarZk]: ZkChainId.AstarZk,
};

export const EthBridgeChainIdToName = {
  [ZkChainId.Sepolia]: EthBridgeNetworkName.Sepolia,
  [ZkChainId.Ethereum]: EthBridgeNetworkName.Ethereum,
  [ZkChainId.Zkyoto]: EthBridgeNetworkName.Zkyoto,
  [ZkChainId.AstarZk]: EthBridgeNetworkName.AstarZk,
};

export const zkBridgeIcon = {
  [EthBridgeNetworkName.Sepolia]: require('/src/assets/img/ethereum.png'),
  [EthBridgeNetworkName.Ethereum]: require('/src/assets/img/ethereum.png'),
  [EthBridgeNetworkName.Zkyoto]: require('src/assets/img/chain/zkatana-logo.png'),
  [EthBridgeNetworkName.AstarZk]: require('src/assets/img/chain/zkatana-logo.png'),
} as any;

export interface BridgeHistory {
  leaf_type: number;
  orig_net: number;
  orig_addr: string;
  amount: string;
  dest_net: number;
  dest_addr: string;
  block_num: string;
  deposit_cnt: string;
  network_id: ZkNetworkId;
  tx_hash: string;
  claim_tx_hash: string;
  metadata: string;
  ready_for_claim: boolean;
  global_index: string;
  timestamp?: number;
  isActionRequired?: boolean;
  symbol?: string;
  name?: string;
  decimal?: number;
}

export enum ZkNetworkId {
  L1 = 0,
  L2_PolygonZk = 1,
  L2_AstarZk = 2,
}

export interface ZkToken {
  symbol: string;
  decimal: number;
  address: string;
  name: string;
  toChainTokenAddress?: string;
  fromChainBalance?: number;
  toChainBalance?: number;
  image?: string;
}

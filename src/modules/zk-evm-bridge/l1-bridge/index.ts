import ABI_ZK_EVM_BRIDGE from 'src/config/web3/abi/zkevm-bridge-abi.json';
import ABI_ZK_EVM_AGGREGATED_BRIDGE from 'src/config/web3/abi/zkevm-aggregated-bridge-abi.json';
export * from './utils';

// Todo: combine to one abi after zKatana has been migrated
export const ZK_EVM_BRIDGE_ABI = ABI_ZK_EVM_BRIDGE;
export const ZK_EVM_AGGREGATED_BRIDGE_ABI = ABI_ZK_EVM_AGGREGATED_BRIDGE;

export const zkEvmApi = {
  testnet: 'https://bridge-api.zkatana.gelato.digital',
  mainnet: 'https://bridge-api.astar-zkevm.gelato.digital',
};

export enum EthBridgeNetworkName {
  'Sepolia' = 'Sepolia Testnet',
  'Zkatana' = 'zKatana Testnet',
  'Ethereum' = 'Ethereum',
  'AstarZk' = 'Astar zkEVM',
}

// Memo: do not import from src/config/web3 due to reference conflicts
export enum ZkChainId {
  'Sepolia' = 11155111,
  'Zkatana' = 1261120,
  'Ethereum' = 1,
  'AstarZk' = 3776,
}

export const EthBridgeContract = {
  [EthBridgeNetworkName.Sepolia]: '0xA34BBAf52eE84Cd95a6d5Ac2Eab9de142D4cdB53',
  [EthBridgeNetworkName.Ethereum]: '0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe',
  [EthBridgeNetworkName.Zkatana]: '0xA34BBAf52eE84Cd95a6d5Ac2Eab9de142D4cdB53',
  [EthBridgeNetworkName.AstarZk]: '0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe',
};

export const EthBridgeChainId = {
  [EthBridgeNetworkName.Sepolia]: ZkChainId.Sepolia,
  [EthBridgeNetworkName.Ethereum]: ZkChainId.Ethereum,
  [EthBridgeNetworkName.Zkatana]: ZkChainId.Zkatana,
  [EthBridgeNetworkName.AstarZk]: ZkChainId.AstarZk,
};

export const EthBridgeChainIdToName = {
  [ZkChainId.Sepolia]: EthBridgeNetworkName.Sepolia,
  [ZkChainId.Ethereum]: EthBridgeNetworkName.Ethereum,
  [ZkChainId.Zkatana]: EthBridgeNetworkName.Zkatana,
  [ZkChainId.AstarZk]: EthBridgeNetworkName.AstarZk,
};

export const zkBridgeIcon = {
  [EthBridgeNetworkName.Sepolia]: require('/src/assets/img/ethereum.png'),
  [EthBridgeNetworkName.Ethereum]: require('/src/assets/img/ethereum.png'),
  [EthBridgeNetworkName.Zkatana]: require('src/assets/img/chain/zkatana-logo.png'),
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
  // Todo: remove '?'
  global_index?: string;
  timestamp?: number;
  isActionRequired?: boolean;
  symbol?: string;
  name?: string;
  decimal?: number;
}

export enum ZkNetworkId {
  L1 = 0,
  L2_Testnet = 1,
  L2_Mainnet = 2,
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

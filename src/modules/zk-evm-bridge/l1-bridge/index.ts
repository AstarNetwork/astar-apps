import { EVM } from 'src/config/web3';
import ABI_ZK_EVM_BRIDGE from 'src/config/web3/abi/zkevm-bridge-abi.json';
export * from './utils';

export const ZK_EVM_BRIDGE_ABI = ABI_ZK_EVM_BRIDGE;

// Todo: update to https
export const zkEvmApi = {
  testnet: 'https://bridge-api.zkatana.gelato.digital',
  mainnet: 'https://akiba-bridge-api.astar.network',
};

export enum EthBridgeNetworkName {
  'Sepolia' = 'Sepolia',
  'Zkatana' = 'zKatana',
  'Ethereum' = 'Ethereum',
  'AstarZk' = 'Astar zkEVM',
}

// Todo: check mainnet contract
export const EthBridgeContract = {
  [EthBridgeNetworkName.Sepolia]: '0xA34BBAf52eE84Cd95a6d5Ac2Eab9de142D4cdB53',
  [EthBridgeNetworkName.Ethereum]: '0xA34BBAf52eE84Cd95a6d5Ac2Eab9de142D4cdB53',
  [EthBridgeNetworkName.Zkatana]: '0xA34BBAf52eE84Cd95a6d5Ac2Eab9de142D4cdB53',
  [EthBridgeNetworkName.AstarZk]: '0xA34BBAf52eE84Cd95a6d5Ac2Eab9de142D4cdB53',
};

export const EthBridgeChainId = {
  [EthBridgeNetworkName.Sepolia]: EVM.SEPOLIA_TESTNET,
  [EthBridgeNetworkName.Ethereum]: EVM.ETHEREUM_MAINNET,
  [EthBridgeNetworkName.Zkatana]: EVM.ZKATANA_TESTNET,
  [EthBridgeNetworkName.AstarZk]: EVM.ASTAR_ZKEVM_MAINNET,
};

export const zkBridgeIcon = {
  [EthBridgeNetworkName.Sepolia]: require('/src/assets/img/ethereum.png'),
  [EthBridgeNetworkName.Ethereum]: require('/src/assets/img/ethereum.png'),
  [EthBridgeNetworkName.Zkatana]: require('src/assets/img/chain/shibuya.png'),
  [EthBridgeNetworkName.AstarZk]: require('src/assets/img/chain/shibuya.png'),
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
  timestamp?: number;
  isActionRequired?: boolean;
  symbol?: string;
  name?: string;
  decimal?: number;
}

export enum ZkNetworkId {
  L1 = 0,
  L2 = 1,
}

export interface ZkToken {
  symbol: string;
  decimal: number;
  address: string;
  name: string;
  toChainTokenAddress?: string;
  fromChainBalance?: number;
  toChainBalance?: number;
}

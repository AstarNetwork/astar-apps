import { EVM } from 'src/config/web3';
import ABI_ZK_EVM_BRIDGE from 'src/config/web3/abi/zkevm-bridge-abi.json';
export * from './utils';

export const ZK_EVM_BRIDGE_ABI = ABI_ZK_EVM_BRIDGE;

// Todo: update to https
export const zkEvmApi = {
  testnet: 'http://161.35.17.216:8081',
  mainnet: 'http://161.35.17.216:8081',
};

export enum EthBridgeNetworkName {
  'Sepolia' = 'Sepolia',
  'Akiba' = 'Akiba zkEVM',
  'Ethereum' = 'Ethereum',
  'Astar' = 'Astar zkEVM',
}

// Todo: check mainnet contract
export const EthBridgeContract = {
  [EthBridgeNetworkName.Sepolia]: '0xE3583F529aA992D21A8fae3f3c37d94900339C7F',
  [EthBridgeNetworkName.Ethereum]: '0xE3583F529aA992D21A8fae3f3c37d94900339C7F',
  [EthBridgeNetworkName.Akiba]: '0xE3583F529aA992D21A8fae3f3c37d94900339C7F',
  [EthBridgeNetworkName.Astar]: '0xE3583F529aA992D21A8fae3f3c37d94900339C7F',
};

export const EthBridgeChainId = {
  [EthBridgeNetworkName.Sepolia]: EVM.SEPOLIA_TESTNET,
  [EthBridgeNetworkName.Ethereum]: EVM.ETHEREUM_MAINNET,
  [EthBridgeNetworkName.Akiba]: EVM.AKIBA_TESTNET,
  [EthBridgeNetworkName.Astar]: EVM.ASTAR_ZKEVM_MAINNET,
};

export const zkBridgeIcon = {
  [EthBridgeNetworkName.Sepolia]: require('/src/assets/img/ethereum.png'),
  [EthBridgeNetworkName.Ethereum]: require('/src/assets/img/ethereum.png'),
  [EthBridgeNetworkName.Akiba]: require('src/assets/img/chain/shibuya.png'),
  [EthBridgeNetworkName.Astar]: require('src/assets/img/chain/shibuya.png'),
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
  network_id: number;
  tx_hash: string;
  claim_tx_hash: string;
  metadata: string;
  ready_for_claim: boolean;
  timestamp?: number;
}

export enum ZkNetworkId {
  L1 = 0,
  L2 = 1,
}

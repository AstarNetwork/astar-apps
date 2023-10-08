import { EVM } from 'src/config/web3';
import ABI_ZK_EVM_BRIDGE from 'src/config/web3/abi/zkevm-bridge-abi.json';

export const ZK_EVM_BRIDGE_ABI = ABI_ZK_EVM_BRIDGE;

export enum EthBridgeNetworkName {
  'Sepolia' = 'Sepolia Testnet',
  'Akiba' = 'Akiba zkEVM Testnet',
  'Ethereum' = 'Ethereum Mainnet',
  'Astar' = 'Astar zkEVM Mainnet',
}

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

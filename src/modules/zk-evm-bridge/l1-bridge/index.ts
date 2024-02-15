import ABI_ZK_EVM_BRIDGE from 'src/config/web3/abi/zkevm-bridge-abi.json';
export * from './utils';

export const ZK_EVM_BRIDGE_ABI = ABI_ZK_EVM_BRIDGE;

// Todo: update to https
export const zkEvmApi = {
  testnet: 'https://bridge-api.zkyoto.gelato.digital',
  mainnet: 'https://akiba-bridge-api.astar.network',
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
  'AstarZk' = 9999999, // Todo: update
}

// Todo: check mainnet contract
export const EthBridgeContract = {
  [EthBridgeNetworkName.Sepolia]: '0x46d13b853f1B4cf7FEa9fDb335445A197Ef7374D',
  [EthBridgeNetworkName.Ethereum]: '0x46d13b853f1B4cf7FEa9fDb335445A197Ef7374D',
  [EthBridgeNetworkName.Zkyoto]: '0x46d13b853f1B4cf7FEa9fDb335445A197Ef7374D',
  [EthBridgeNetworkName.AstarZk]: '0x46d13b853f1B4cf7FEa9fDb335445A197Ef7374D',
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
  [ZkChainId.AstarZk]: EthBridgeNetworkName.AstarZk, // Todo: update
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
  image?: string;
}

// Ref: https://github.com/0xPolygonHermez/zkevm-bridge-ui/blob/7c84791d06770569d316f27d62c3989bef81be58/src/constants.ts#L73
export const TOKEN_BLACKLIST = [
  // WETH
  // '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  // '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  // '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
  '',
];

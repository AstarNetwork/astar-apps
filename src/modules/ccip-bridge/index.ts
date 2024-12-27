import {
  SONEIUM_ASTR_CONTRACT,
  SONEIUM_CCIP_CHAIN_SELECTOR,
  SONEIUM_CCIP_ROUTER,
  SONEIUM_CHAIN_ID,
} from 'src/config/env';
import { astarNativeTokenErcAddr } from '../xcm';

export enum CcipNetworkName {
  'ShibuyaEvm' = 'Shibuya EVM',
  'AstarEvm' = 'Astar EVM',
  'SoneiumMinato' = 'Soneium Minato',
  'Soneium' = 'Soneium',
}

export enum CcipChainId {
  'ShibuyaEvm' = 81,
  'AstarEvm' = 592,
  'SoneiumMinato' = 1946,
  // Todo: update
  'Soneium' = SONEIUM_CHAIN_ID,
}

export const ccipChainId = {
  [CcipNetworkName.ShibuyaEvm]: CcipChainId.ShibuyaEvm,
  [CcipNetworkName.AstarEvm]: CcipChainId.AstarEvm,
  [CcipNetworkName.SoneiumMinato]: CcipChainId.SoneiumMinato,
  [CcipNetworkName.Soneium]: CcipChainId.Soneium,
};

export const ccipChainSelector = {
  [CcipChainId.ShibuyaEvm]: '6955638871347136141',
  // Todo: update
  [CcipChainId.AstarEvm]: '6422105447186081193',
  [CcipChainId.SoneiumMinato]: '686603546605904534',
  // Todo: update
  [CcipChainId.Soneium]: SONEIUM_CCIP_CHAIN_SELECTOR,
};

const routerSoneiumMinato = '0x443a1bce545d56E2c3f20ED32eA588395FFce0f4';
const routerSoneium = SONEIUM_CCIP_ROUTER;

const etherSenderReceiverShibuya = '0x89cB78A4A3cAD4cA86D3e3fF565f63B4620CB6ea';
const etherSenderReceiverAstar = '0x4036a6Ff8C1a29677108Aef299B560f6E4fA5e71';

export const ccipBridgeAddress = {
  [CcipChainId.ShibuyaEvm]: etherSenderReceiverShibuya,
  [CcipChainId.AstarEvm]: etherSenderReceiverAstar,
  [CcipChainId.SoneiumMinato]: routerSoneiumMinato,
  [CcipChainId.Soneium]: routerSoneium,
};

export const ccipBridgeIcon = {
  [CcipNetworkName.ShibuyaEvm]: require('src/assets/img/chain/astar.png'),
  [CcipNetworkName.AstarEvm]: require('src/assets/img/chain/astar.png'),
  [CcipNetworkName.SoneiumMinato]: require('src/assets/img/chain/soneium-black.svg'),
  [CcipNetworkName.Soneium]: require('src/assets/img/chain/soneium-black.svg'),
} as any;

export interface CCIP_TOKEN {
  symbol: string;
  name: string;
  tokenAddress: { [key in CcipChainId]?: string };
  decimals: number;
  image: string;
}

export const CCIP_SBY: CCIP_TOKEN = {
  symbol: 'SBY',
  name: 'Shibuya Token',
  tokenAddress: {
    [CcipChainId.ShibuyaEvm]: astarNativeTokenErcAddr,
    [CcipChainId.SoneiumMinato]: '0x3c1F7c5f4C560afFCFe2b5ebF1271c3310867ff4',
  },
  decimals: 18,
  image: require('/src/assets/img/token/astr.png'),
};

export const CCIP_ASTR: CCIP_TOKEN = {
  symbol: 'ASTR',
  name: 'Astar Token',
  tokenAddress: {
    [CcipChainId.AstarEvm]: astarNativeTokenErcAddr,
    [CcipChainId.Soneium]: SONEIUM_ASTR_CONTRACT,
  },
  decimals: 18,
  image: require('/src/assets/img/token/astr.png'),
};

export const ccipBridgeTime = {
  [CcipNetworkName.ShibuyaEvm]: 3,
  [CcipNetworkName.AstarEvm]: 3,
  [CcipNetworkName.SoneiumMinato]: 30,
  [CcipNetworkName.Soneium]: 30,
};

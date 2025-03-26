import { astarNativeTokenErcAddr } from '../xcm';

export enum CcipNetworkName {
  'ShibuyaEvm' = 'Shibuya EVM',
  'AstarEvm' = 'Astar EVM',
  'SoneiumMinato' = 'Soneium Minato',
  'Soneium' = 'Soneium',
  'Sepolia' = 'Sepolia',
  'Ethereum' = 'Ethereum',
}

export enum CcipNetworkParam {
  'ShibuyaEvm' = 'shibuya',
  'AstarEvm' = 'astar',
  'SoneiumMinato' = 'minato',
  'Soneium' = 'soneium',
  'Sepolia' = 'sepolia',
  'Ethereum' = 'ethereum',
}

export enum CcipChainId {
  'ShibuyaEvm' = 81,
  'AstarEvm' = 592,
  'SoneiumMinato' = 1946,
  'Soneium' = 1868,
  'Sepolia' = 11155111,
  'Ethereum' = 1,
}

export const ccipNetworkParam = {
  [CcipNetworkParam.ShibuyaEvm]: CcipNetworkName.ShibuyaEvm,
  [CcipNetworkParam.AstarEvm]: CcipNetworkName.AstarEvm,
  [CcipNetworkParam.SoneiumMinato]: CcipNetworkName.SoneiumMinato,
  [CcipNetworkParam.Soneium]: CcipNetworkName.Soneium,
  [CcipNetworkParam.Sepolia]: CcipNetworkName.Sepolia,
  [CcipNetworkParam.Ethereum]: CcipNetworkName.Ethereum,
};

export const ccipChainId = {
  [CcipNetworkName.ShibuyaEvm]: CcipChainId.ShibuyaEvm,
  [CcipNetworkName.AstarEvm]: CcipChainId.AstarEvm,
  [CcipNetworkName.SoneiumMinato]: CcipChainId.SoneiumMinato,
  [CcipNetworkName.Soneium]: CcipChainId.Soneium,
  [CcipNetworkName.Sepolia]: CcipChainId.Sepolia,
  [CcipNetworkName.Ethereum]: CcipChainId.Ethereum,
};

export const ccipChainSelector = {
  [CcipChainId.ShibuyaEvm]: '6955638871347136141',
  [CcipChainId.AstarEvm]: '6422105447186081193',
  [CcipChainId.SoneiumMinato]: '686603546605904534',
  [CcipChainId.Soneium]: '12505351618335765396',
  [CcipChainId.Sepolia]: '16015286601757825753',
  [CcipChainId.Ethereum]: '5009297550715157269',
};

const routerSoneiumMinato = '0x443a1bce545d56E2c3f20ED32eA588395FFce0f4';
const routerSoneium = '0x8C8B88d827Fe14Df2bc6392947d513C86afD6977';
const routerSepolia = '0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59';
const routerEthereum = '0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D';
const etherSenderReceiverShibuya = '0x89cB78A4A3cAD4cA86D3e3fF565f63B4620CB6ea';
const etherSenderReceiverAstar = '0x4036a6Ff8C1a29677108Aef299B560f6E4fA5e71';

export const ccipBridgeAddress = {
  [CcipChainId.ShibuyaEvm]: etherSenderReceiverShibuya,
  [CcipChainId.AstarEvm]: etherSenderReceiverAstar,
  [CcipChainId.SoneiumMinato]: routerSoneiumMinato,
  [CcipChainId.Soneium]: routerSoneium,
  [CcipChainId.Sepolia]: routerSepolia,
  [CcipChainId.Ethereum]: routerEthereum,
};

export const ccipTokenPoolAddress = {
  [CcipChainId.ShibuyaEvm]: '0xeD27dA98958AC5Bcd4729E91d91Df8f4910dF941',
  [CcipChainId.AstarEvm]: '0x99B41d3e1529dF578f02d68c0c11a0Ca89a522d0',
  [CcipChainId.SoneiumMinato]: '0xae6CD71f30BcaBEe12Bb25B2aB6Bc84132430F2B',
  [CcipChainId.Soneium]: '0x2200B5f4fA30a55359Ef0FaE04890113BD73bd16',
  [CcipChainId.Sepolia]: '0x8BEDECB512cCAD2962ce284DdE4540Aa219fa728',
  [CcipChainId.Ethereum]: '0x98ef4b1fe8fe9c73deb07a77c9f861e8558439d7',
};

export const ccipBridgeIcon = {
  [CcipNetworkName.ShibuyaEvm]: require('src/assets/img/chain/astar.png'),
  [CcipNetworkName.AstarEvm]: require('src/assets/img/chain/astar.png'),
  [CcipNetworkName.SoneiumMinato]: require('src/assets/img/chain/soneium-black.svg'),
  [CcipNetworkName.Soneium]: require('src/assets/img/chain/soneium-black.svg'),
  [CcipNetworkName.Sepolia]: require('src/assets/img/ethereum.png'),
  [CcipNetworkName.Ethereum]: require('src/assets/img/ethereum.png'),
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
    [CcipChainId.Sepolia]: '0x530cAA61D6bEF863309c1EAA2571A3A4CCB603d1',
  },
  decimals: 18,
  image: require('/src/assets/img/token/astr.png'),
};

export const CCIP_ASTR: CCIP_TOKEN = {
  symbol: 'ASTR',
  name: 'Astar Token',
  tokenAddress: {
    [CcipChainId.AstarEvm]: astarNativeTokenErcAddr,
    [CcipChainId.Soneium]: '0x2CAE934a1e84F693fbb78CA5ED3B0A6893259441',
    [CcipChainId.Ethereum]: '0xf27441230eadeac85b764610325cc9a0d7859689',
  },
  decimals: 18,
  image: require('/src/assets/img/token/astr.png'),
};

interface BridgeTimeMap {
  [key: string]: {
    [key: string]: number;
  };
}

// Memo: time for from -> destination chain
export const ccipBridgeTime: BridgeTimeMap = {
  [CcipNetworkName.ShibuyaEvm]: {
    [CcipNetworkName.SoneiumMinato]: 3,
    [CcipNetworkName.Sepolia]: 20,
  },
  [CcipNetworkName.AstarEvm]: {
    [CcipNetworkName.Soneium]: 3,
    [CcipNetworkName.Ethereum]: 3,
  },
  [CcipNetworkName.SoneiumMinato]: {
    [CcipNetworkName.ShibuyaEvm]: 30,
    [CcipNetworkName.Sepolia]: 30,
  },
  [CcipNetworkName.Soneium]: {
    [CcipNetworkName.AstarEvm]: 120,
    [CcipNetworkName.Ethereum]: 30,
  },
  [CcipNetworkName.Sepolia]: {
    [CcipNetworkName.ShibuyaEvm]: 20,
    [CcipNetworkName.SoneiumMinato]: 20,
  },
  [CcipNetworkName.Ethereum]: {
    [CcipNetworkName.AstarEvm]: 20,
    [CcipNetworkName.Soneium]: 20,
  },
};

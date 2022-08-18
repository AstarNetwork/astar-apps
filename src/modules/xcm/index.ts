import { objToArray } from 'src/hooks/helper/common';

export { xcmToken } from './tokens';
export {
  getXcmToken,
  fetchXcmBalance,
  fetchExistentialDeposit,
  checkIsDeposit,
  monitorBalanceIncreasing,
} from './utils';

export const PREFIX_ASTAR = 5;

export interface XcmTokenInformation {
  symbol: string;
  assetId: string;
  logo: string;
  isNativeToken: boolean;
  isXcmCompatible: boolean;
  originAssetId: string;
  originChain: string;
  minBridgeAmount: string;
}

export interface ExistentialDeposit {
  amount: string;
  chain: string;
  symbol: string;
  // Memo: minimum balance keeps in relaychain
  originChainMinBal: number;
}

// Ref: RPC calls -> system -> chain()
export enum Chain {
  POLKADOT = 'Polkadot',
  ASTAR = 'Astar',
  KUSAMA = 'Kusama',
  SHIDEN = 'Shiden',
  STATEMINE = 'Statemine',
  KARURA = 'Karura',
  ACALA = 'Acala',
  MOONRIVER = 'Moonriver',
  // MOONBEAM = 'Moonbeam',
}

export enum parachainIds {
  ASTAR = 2006,
  SHIDEN = 2007,
  KARURA = 2000,
  STATEMINE = 1000,
  ACALA = 2000,
  MOONRIVER = 2023,
  // MOONBEAM = 2004,
}

// Memo: give it 0 ide for convenience in checking para/relay chain logic
export const relaychainParaId = 0;

export interface XcmChain {
  name: Chain;
  relayChain: Chain;
  img: string;
  parachainId: parachainIds;
  endpoint?: string;
  // Note: true if ASTR/SDN is listed on the parachain
  isAstarToken?: boolean;
}

type XcmChainObj = {
  [key in Chain]: XcmChain;
};

export const xcmChainObj: XcmChainObj = {
  [Chain.POLKADOT]: {
    name: Chain.POLKADOT,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/ic_polkadot.png'),
    parachainId: relaychainParaId,
    endpoint: 'wss://polkadot.api.onfinality.io/public-ws',
    isAstarToken: false,
  },
  [Chain.ASTAR]: {
    name: Chain.ASTAR,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/ic_astar.png'),
    parachainId: parachainIds.ASTAR,
  },
  [Chain.KUSAMA]: {
    name: Chain.KUSAMA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/ic_kusama.png'),
    parachainId: relaychainParaId,
    endpoint: 'wss://kusama-rpc.polkadot.io',
    isAstarToken: false,
  },
  [Chain.SHIDEN]: {
    name: Chain.SHIDEN,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/ic_shiden.png'),
    parachainId: parachainIds.SHIDEN,
  },
  [Chain.STATEMINE]: {
    name: Chain.STATEMINE,
    relayChain: Chain.KUSAMA,
    img: 'https://polkadot.js.org/apps/static/statemine.65437936..svg',
    parachainId: parachainIds.STATEMINE,
    endpoint: 'wss://statemine-rpc.polkadot.io',
    isAstarToken: false,
  },
  [Chain.KARURA]: {
    name: Chain.KARURA,
    relayChain: Chain.KUSAMA,
    img: 'https://polkadot.js.org/apps/static/karura.6540c949..svg',
    parachainId: parachainIds.KARURA,
    endpoint: 'wss://karura.api.onfinality.io/public-ws',
    isAstarToken: true,
  },
  [Chain.ACALA]: {
    name: Chain.ACALA,
    relayChain: Chain.POLKADOT,
    img: 'https://polkadot.js.org/apps/static/acala.696aa448..svg',
    parachainId: parachainIds.ACALA,
    endpoint: 'wss://acala-polkadot.api.onfinality.io/public-ws',
    isAstarToken: true,
  },
  [Chain.MOONRIVER]: {
    name: Chain.MOONRIVER,
    relayChain: Chain.KUSAMA,
    img: 'https://assets.coingecko.com/coins/images/17984/small/9285.png?1630028620',
    parachainId: parachainIds.MOONRIVER,
    endpoint: 'wss://wss.api.moonriver.moonbeam.network',
    isAstarToken: true,
  },
  // Todo: un-comment-out after channel between Astar and Moonbeam has been opened
  // [Chain.MOONBEAM]: {
  //   name: Chain.MOONBEAM,
  //   relayChain: Chain.POLKADOT,
  //   img: 'https://polkadot.js.org/apps/static/moonbeam.3204d901..png',
  //   parachainId: parachainIds.MOONBEAM,
  //   endpoint: 'wss://wss.api.moonbeam.network',
  // },
};

const xcmChains = objToArray(xcmChainObj);

export const kusamaParachains = xcmChains.filter((it) => {
  return it.relayChain === Chain.KUSAMA && it.name !== Chain.KUSAMA && it.isAstarToken;
});
export const polkadotParachains = xcmChains.filter(
  (it) => it.relayChain === Chain.POLKADOT && it.name !== Chain.POLKADOT && it.isAstarToken
);

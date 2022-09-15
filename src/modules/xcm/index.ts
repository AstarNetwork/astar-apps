import { ApiPromise } from '@polkadot/api';
import { objToArray } from 'src/hooks/helper/common';
import { AcalaApi, MoonbeamApi, StatemintApi } from 'src/hooks/xcm/parachainApi';
import { AstarApi, ChainApi } from 'src/hooks/xcm/SubstrateApi';

export {
  astarNativeTokenErcAddr,
  generateAssetFromEvmToken,
  xcmToken,
} from 'src/modules/xcm/tokens';
export {
  addXcmTxHistories,
  castChainName,
  checkIsAstarNativeToken,
  checkIsDeposit,
  checkIsSupportAstarNativeToken,
  fetchExistentialDeposit,
  fetchXcmBalance,
  getXcmToken,
  monitorBalanceIncreasing,
  removeEvmName,
} from 'src/modules/xcm/utils';

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
  ASTAR_EVM = 'Astar-evm',
  KUSAMA = 'Kusama',
  SHIDEN = 'Shiden',
  SHIDEN_EVM = 'Shiden-evm',
  KARURA = 'Karura',
  ACALA = 'Acala',
  MOONRIVER = 'Moonriver',
  MOONBEAM = 'Moonbeam',
  STATEMINE = 'Statemine',
}

export enum parachainIds {
  ASTAR = 2006,
  SHIDEN = 2007,
  KARURA = 2000,
  ACALA = 2000,
  MOONRIVER = 2023,
  MOONBEAM = 2004,
  STATEMINE = 1000,
}

// Memo: give it 0 ide for convenience in checking para/relay chain logic
export const relaychainParaId = 0;

export const astarChains = [Chain.ASTAR, Chain.SHIDEN, Chain.ASTAR_EVM, Chain.SHIDEN_EVM];
export interface XcmChain {
  name: Chain;
  relayChain: Chain;
  img: string;
  parachainId: parachainIds;
  endpoint: string;
  subscan: string;
  // Note: true if ASTR/SDN is listed on the parachain
  isAstarNativeToken: boolean;
  apiInstance: ({ endpoint, api }: { endpoint: string; api: ApiPromise }) => ChainApi | AstarApi;
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
    subscan: 'https://polkadot.subscan.io',
    isAstarNativeToken: false,
    apiInstance: ({ endpoint }: { endpoint: string }) => new ChainApi(endpoint),
  },
  [Chain.ASTAR]: {
    name: Chain.ASTAR,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/ic_astar.png'),
    parachainId: parachainIds.ASTAR,
    endpoint: 'wss://astar-rpc.dwellir.com',
    subscan: 'https://astar.subscan.io',
    isAstarNativeToken: false,
    apiInstance: ({ api }: { api: ApiPromise }) => new AstarApi(api),
  },
  [Chain.ASTAR_EVM]: {
    name: Chain.ASTAR_EVM,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/ic_astar.png'),
    parachainId: parachainIds.ASTAR,
    endpoint: 'wss://astar-rpc.dwellir.com',
    subscan: 'https://astar.subscan.io',
    isAstarNativeToken: false,
    apiInstance: ({ api }: { api: ApiPromise }) => new AstarApi(api),
  },
  [Chain.KUSAMA]: {
    name: Chain.KUSAMA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/ic_kusama.png'),
    parachainId: relaychainParaId,
    endpoint: 'wss://kusama-rpc.polkadot.io',
    subscan: 'https://kusama.subscan.io',
    isAstarNativeToken: false,
    apiInstance: ({ endpoint }: { endpoint: string }) => new ChainApi(endpoint),
  },
  [Chain.SHIDEN]: {
    name: Chain.SHIDEN,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/ic_shiden.png'),
    parachainId: parachainIds.SHIDEN,
    endpoint: 'wss://shiden-rpc.dwellir.com',
    subscan: 'https://shiden.subscan.io',
    isAstarNativeToken: false,
    apiInstance: ({ api }: { api: ApiPromise }) => new AstarApi(api),
  },
  [Chain.SHIDEN_EVM]: {
    name: Chain.SHIDEN_EVM,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/ic_shiden.png'),
    parachainId: parachainIds.SHIDEN,
    endpoint: 'wss://shiden-rpc.dwellir.com',
    subscan: 'https://shiden.subscan.io',
    isAstarNativeToken: false,
    apiInstance: ({ api }: { api: ApiPromise }) => new AstarApi(api),
  },
  [Chain.STATEMINE]: {
    name: Chain.STATEMINE,
    relayChain: Chain.KUSAMA,
    img: 'https://polkadot.js.org/apps/static/statemine.65437936..svg',
    parachainId: parachainIds.STATEMINE,
    endpoint: 'wss://statemine-rpc.polkadot.io',
    subscan: 'https://statemine.subscan.io',
    isAstarNativeToken: false,
    apiInstance: ({ endpoint }: { endpoint: string }) => new StatemintApi(endpoint),
  },
  [Chain.KARURA]: {
    name: Chain.KARURA,
    relayChain: Chain.KUSAMA,
    img: 'https://polkadot.js.org/apps/static/karura.6540c949..svg',
    parachainId: parachainIds.KARURA,
    endpoint: 'wss://karura-rpc.dwellir.com',
    subscan: 'https://karura.subscan.io',
    isAstarNativeToken: true,
    apiInstance: ({ endpoint }: { endpoint: string }) => new AcalaApi(endpoint),
  },
  [Chain.ACALA]: {
    name: Chain.ACALA,
    relayChain: Chain.POLKADOT,
    img: 'https://polkadot.js.org/apps/static/acala.696aa448..svg',
    parachainId: parachainIds.ACALA,
    endpoint: 'wss://acala-polkadot.api.onfinality.io/public-ws',
    subscan: 'https://acala.subscan.io',
    isAstarNativeToken: true,
    apiInstance: ({ endpoint }: { endpoint: string }) => new AcalaApi(endpoint),
  },
  [Chain.MOONRIVER]: {
    name: Chain.MOONRIVER,
    relayChain: Chain.KUSAMA,
    img: 'https://assets.coingecko.com/coins/images/17984/small/9285.png?1630028620',
    parachainId: parachainIds.MOONRIVER,
    endpoint: 'wss://wss.api.moonriver.moonbeam.network',
    subscan: 'https://moonriver.subscan.io',
    isAstarNativeToken: true,
    apiInstance: ({ endpoint }: { endpoint: string }) => new MoonbeamApi(endpoint),
  },
  [Chain.MOONBEAM]: {
    name: Chain.MOONBEAM,
    relayChain: Chain.POLKADOT,
    img: 'https://assets.coingecko.com/coins/images/22459/small/glmr.png?1641880985',
    parachainId: parachainIds.MOONBEAM,
    endpoint: 'wss://wss.api.moonbeam.network',
    subscan: 'https://moonbeam.subscan.io',
    isAstarNativeToken: true,
    apiInstance: ({ endpoint }: { endpoint: string }) => new MoonbeamApi(endpoint),
  },
};

export const xcmChains = objToArray(xcmChainObj);

export const kusamaParachains = xcmChains.filter(
  (it) => it.relayChain === Chain.KUSAMA && it.name !== Chain.KUSAMA
);
export const polkadotParachains = xcmChains.filter(
  (it) => it.relayChain === Chain.POLKADOT && it.name !== Chain.POLKADOT
);

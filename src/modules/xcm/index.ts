import { objToArray } from '@astar-network/astar-sdk-core';
import { Chain, parachainIds, XcmChain } from 'src/v2/models';

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
  castXcmEndpoint,
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

// Memo: give it 0 ide for convenience in checking para/relay chain logic
export const relaychainParaId = 0;

type XcmChainObj = {
  [key in Chain]: XcmChain;
};

export let xcmChainObj: XcmChainObj = {
  [Chain.POLKADOT]: {
    name: Chain.POLKADOT,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/chain/polkadot.png'),
    parachainId: relaychainParaId,
    endpoint: 'wss://polkadot.api.onfinality.io/public-ws',
    chopsticksEndpoint: 'ws://localhost:9950',
    subscan: 'https://polkadot.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.ASTAR]: {
    name: Chain.ASTAR,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/chain/astar.png'),
    parachainId: parachainIds.ASTAR,
    endpoint: 'wss://rpc.astar.network',
    chopsticksEndpoint: 'ws://localhost:9944',
    subscan: 'https://astar.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.ASTAR_EVM]: {
    name: Chain.ASTAR_EVM,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/chain/astar.png'),
    parachainId: parachainIds.ASTAR,
    endpoint: 'wss://rpc.astar.network',
    subscan: 'https://astar.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.KUSAMA]: {
    name: Chain.KUSAMA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/kusama.png'),
    parachainId: relaychainParaId,
    endpoint: 'wss://kusama-rpc.polkadot.io',
    subscan: 'https://kusama.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.SHIDEN]: {
    name: Chain.SHIDEN,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/sdn.png'),
    parachainId: parachainIds.SHIDEN,
    endpoint: 'wss://rpc.shiden.astar.network',
    subscan: 'https://shiden.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.SHIDEN_EVM]: {
    name: Chain.SHIDEN_EVM,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/sdn.png'),
    parachainId: parachainIds.SHIDEN,
    endpoint: 'wss://rpc.shiden.astar.network',
    subscan: 'https://shiden.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.STATEMINE]: {
    name: Chain.STATEMINE,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/chain/statemine.svg'),
    parachainId: parachainIds.STATEMINE,
    endpoint: 'wss://statemine-rpc.polkadot.io',
    subscan: 'https://statemine.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.KARURA]: {
    name: Chain.KARURA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/kar.png'),
    parachainId: parachainIds.KARURA,
    endpoint: 'wss://karura.api.onfinality.io/public-ws',
    subscan: 'https://karura.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.ACALA]: {
    name: Chain.ACALA,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/aca.png'),
    parachainId: parachainIds.ACALA,
    endpoint: 'wss://acala-polkadot.api.onfinality.io/public-ws',
    chopsticksEndpoint: 'ws://localhost:9946',
    subscan: 'https://acala.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.MOONRIVER]: {
    name: Chain.MOONRIVER,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/movr.png'),
    parachainId: parachainIds.MOONRIVER,
    endpoint: 'wss://wss.api.moonriver.moonbeam.network',
    subscan: 'https://moonriver.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.MOONBEAM]: {
    name: Chain.MOONBEAM,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/glmr.png'),
    parachainId: parachainIds.MOONBEAM,
    endpoint: 'wss://wss.api.moonbeam.network',
    chopsticksEndpoint: 'ws://localhost:9945',
    subscan: 'https://moonbeam.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.STATEMINT]: {
    name: Chain.STATEMINT,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/chain/statemine.svg'),
    parachainId: parachainIds.STATEMINT,
    endpoint: 'wss://statemint-rpc.polkadot.io',
    subscan: 'https://statemint.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.KINTSUGI]: {
    name: Chain.KINTSUGI,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/kint.png'),
    parachainId: parachainIds.KINTSUGI,
    endpoint: 'wss://api-kusama.interlay.io/parachain',
    subscan: 'https://kintsugi.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.INTERLAY]: {
    name: Chain.INTERLAY,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/intr.png'),
    parachainId: parachainIds.INTERLAY,
    endpoint: 'wss://api.interlay.io/parachain',
    chopsticksEndpoint: 'ws://localhost:9948',
    subscan: 'https://interlay.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.CRUST_SHADOW]: {
    name: Chain.CRUST_SHADOW,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/csm.svg'),
    parachainId: parachainIds.CRUST_SHADOW,
    endpoint: 'wss://rpc2-shadow.crust.network',
    subscan: 'https://shadow.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.KHALA]: {
    name: Chain.KHALA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/chain/khala.svg'),
    parachainId: parachainIds.KHALA,
    endpoint: 'wss://khala-api.phala.network/ws',
    subscan: 'https://khala.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.PHALA]: {
    name: Chain.PHALA,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/pha.png'),
    parachainId: parachainIds.PHALA,
    endpoint: 'wss://api.phala.network/ws',
    subscan: 'https://phala.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.BIFROST_POLKADOT]: {
    name: Chain.BIFROST_POLKADOT,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/bnc.svg'),
    parachainId: parachainIds.BIFROST_POLKADOT,
    endpoint: 'wss://hk.p.bifrost-rpc.liebi.com/ws',
    chopsticksEndpoint: 'ws://localhost:9947',
    subscan: 'https://bifrost.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.BIFROST_KUSAMA]: {
    name: Chain.BIFROST_KUSAMA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/bnc.svg'),
    parachainId: parachainIds.BIFROST_KUSAMA,
    endpoint: 'wss://bifrost-rpc.liebi.com/ws',
    subscan: 'https://bifrost-kusama.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.EQUILIBRIUM]: {
    name: Chain.EQUILIBRIUM,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/EQ.png'),
    parachainId: parachainIds.EQUILIBRIUM,
    endpoint: 'wss://node.pol.equilibrium.io/',
    subscan: 'https://equilibrium.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.UNIQUE]: {
    name: Chain.UNIQUE,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/unq.svg'),
    parachainId: parachainIds.UNIQUE,
    endpoint: 'wss://ws.unique.network',
    subscan: 'https://unique.subscan.io',
    isAstarNativeToken: false,
  },
};

export const xcmChains = objToArray(xcmChainObj);

export const kusamaParachains = xcmChains.filter(
  (it) => it.relayChain === Chain.KUSAMA && it.name !== Chain.KUSAMA
);

export const polkadotParachains = xcmChains.filter(
  (it) => it.relayChain === Chain.POLKADOT && it.name !== Chain.POLKADOT
);

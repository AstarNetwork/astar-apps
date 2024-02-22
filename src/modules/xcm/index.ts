import { objToArray } from '@astar-network/astar-sdk-core';
import { astarChain } from 'src/config/chain';
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
    endpoints: [
      'wss://rpc.polkadot.io',
      'wss://polkadot.api.onfinality.io/public-ws',
      'wss://1rpc.io/dot',
      'wss://polkadot-public-rpc.blockops.network/ws',
      'wss://polkadot-rpc.dwellir.com',
      'wss://polkadot-rpc-tn.dwellir.com',
    ],
    chopsticksEndpoint: 'ws://localhost:9950',
    subscan: 'https://polkadot.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.ASTAR]: {
    name: Chain.ASTAR,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/chain/astar.png'),
    parachainId: parachainIds.ASTAR,
    endpoints: [
      'wss://rpc.astar.network',
      'wss://astar-rpc.dwellir.com',
      'wss://astar.public.blastapi.io',
      'wss://astar.api.onfinality.io/public-ws',
      'wss://astar.public.curie.radiumblock.co/ws',
    ],
    chopsticksEndpoint: 'ws://localhost:9944',
    subscan: 'https://astar.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.ASTAR_EVM]: {
    name: Chain.ASTAR_EVM,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/chain/astar.png'),
    parachainId: parachainIds.ASTAR,
    endpoints: [
      'wss://rpc.astar.network',
      'wss://astar-rpc.dwellir.com',
      'wss://astar.public.blastapi.io',
      'wss://astar.api.onfinality.io/public-ws',
      'wss://astar.public.curie.radiumblock.co/ws',
    ],
    subscan: 'https://astar.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.KUSAMA]: {
    name: Chain.KUSAMA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/kusama.png'),
    parachainId: relaychainParaId,
    endpoints: [
      'wss://kusama-rpc.polkadot.io',
      'wss://kusama-rpc.dwellir.com',
      'wss://kusama-rpc.dwellir.com',
      'wss://kusama.api.onfinality.io/public-ws',
      'wss://kusama.public.curie.radiumblock.co/ws',
    ],
    subscan: 'https://kusama.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.SHIDEN]: {
    name: Chain.SHIDEN,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/sdn.png'),
    parachainId: parachainIds.SHIDEN,
    endpoints: [
      'wss://rpc.shiden.astar.network',
      'wss://shiden-rpc.dwellir.com',
      'wss://shiden-rpc.dwellir.com',
      'wss://shiden.public.blastapi.io',
      'wss://shiden.api.onfinality.io/public-ws',
    ],
    chopsticksEndpoint: 'ws://localhost:9961',
    subscan: 'https://shiden.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.SHIDEN_EVM]: {
    name: Chain.SHIDEN_EVM,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/sdn.png'),
    parachainId: parachainIds.SHIDEN,
    endpoints: [
      'wss://rpc.shiden.astar.network',
      'wss://shiden-rpc.dwellir.com',
      'wss://shiden-rpc.dwellir.com',
      'wss://shiden.public.blastapi.io',
      'wss://shiden.api.onfinality.io/public-ws',
    ],
    subscan: 'https://shiden.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.ASSET_HUB_KUSAMA]: {
    name: Chain.ASSET_HUB_KUSAMA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/chain/asset-hub.svg'),
    parachainId: parachainIds.ASSET_HUB_KUSAMA,
    endpoints: [
      'wss://kusama-asset-hub-rpc.polkadot.io',
      'wss://statemine-rpc.dwellir.com',
      'wss://rpc-asset-hub-kusama.luckyfriday.io',
      'wss://statemine.api.onfinality.io/public-ws',
      'wss://statemine.public.curie.radiumblock.co/ws',
    ],
    subscan: 'https://assethub-kusama.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.KARURA]: {
    name: Chain.KARURA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/kar.png'),
    parachainId: parachainIds.KARURA,
    endpoints: [
      'wss://karura-rpc-0.aca-api.network',
      'wss://karura-rpc-1.aca-api.network',
      'wss://karura-rpc-2.aca-api.network/ws',
      'wss://karura-rpc-3.aca-api.network/ws',
      'wss://karura-rpc.dwellir.com',
      'wss://karura.api.onfinality.io/public-ws',
    ],
    subscan: 'https://karura.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.ACALA]: {
    name: Chain.ACALA,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/aca.png'),
    parachainId: parachainIds.ACALA,
    endpoints: [
      'wss://acala-rpc-0.aca-api.network',
      'wss://acala-rpc-1.aca-api.network',
      'wss://acala-rpc-3.aca-api.network/ws',
      'wss://acala-rpc.dwellir.com',
      'wss://acala-polkadot.api.onfinality.io/public-ws',
    ],
    chopsticksEndpoint: 'ws://localhost:9946',
    subscan: 'https://acala.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.MOONRIVER]: {
    name: Chain.MOONRIVER,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/movr.png'),
    parachainId: parachainIds.MOONRIVER,
    endpoints: [
      'wss://wss.api.moonriver.moonbeam.network',
      'wss://moonriver.public.blastapi.io',
      'wss://moonriver-rpc.dwellir.com',
      'wss://moonriver.api.onfinality.io/public-ws',
    ],
    subscan: 'https://moonriver.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.MOONBEAM]: {
    name: Chain.MOONBEAM,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/glmr.png'),
    parachainId: parachainIds.MOONBEAM,
    endpoints: [
      'wss://wss.api.moonbeam.network',
      'wss://1rpc.io/glmr',
      'wss://moonbeam.public.blastapi.io',
      'wss://moonbeam-rpc.dwellir.com',
      'wss://moonbeam.api.onfinality.io/public-ws',
      'wss://moonbeam.unitedbloc.com',
    ],
    chopsticksEndpoint: 'ws://localhost:9945',
    subscan: 'https://moonbeam.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.ASSET_HUB]: {
    name: Chain.ASSET_HUB,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/chain/asset-hub.svg'),
    parachainId: parachainIds.ASSET_HUB,
    endpoints: [
      'wss://statemint-rpc.dwellir.com',
      'wss://polkadot-asset-hub-rpc.polkadot.io',
      'wss://statemint.api.onfinality.io/public-ws',
      'wss://statemint.public.curie.radiumblock.co/ws',
    ],
    subscan: 'https://assethub-polkadot.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.KINTSUGI]: {
    name: Chain.KINTSUGI,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/kint.png'),
    parachainId: parachainIds.KINTSUGI,
    endpoints: [
      'wss://api-kusama.interlay.io/parachain',
      'wss://kintsugi-rpc.dwellir.com',
      'wss://rpc-kintsugi.luckyfriday.io/',
      'wss://kintsugi.api.onfinality.io/public-ws',
    ],
    subscan: 'https://kintsugi.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.INTERLAY]: {
    name: Chain.INTERLAY,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/intr.png'),
    parachainId: parachainIds.INTERLAY,
    endpoints: [
      'wss://api.interlay.io/parachain',
      'wss://interlay-rpc.dwellir.com',
      'wss://rpc-interlay.luckyfriday.io',
      'wss://interlay.api.onfinality.io/public-ws',
    ],
    chopsticksEndpoint: 'ws://localhost:9948',
    subscan: 'https://interlay.subscan.io',
    isAstarNativeToken: false,
  },
  [Chain.CRUST_SHADOW]: {
    name: Chain.CRUST_SHADOW,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/csm.svg'),
    parachainId: parachainIds.CRUST_SHADOW,
    endpoints: ['wss://rpc2-shadow.crust.network', ' wss://rpc-shadow.crust.network'],
    subscan: 'https://shadow.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.KHALA]: {
    name: Chain.KHALA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/chain/khala.svg'),
    parachainId: parachainIds.KHALA,
    endpoints: [
      'wss://khala-api.phala.network/ws',
      'wss://khala-rpc.dwellir.com',
      'wss://khala.api.onfinality.io/public-ws',
    ],
    subscan: 'https://khala.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.PHALA]: {
    name: Chain.PHALA,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/pha.png'),
    parachainId: parachainIds.PHALA,
    endpoints: [
      'wss://api.phala.network/ws',
      'wss://phala-rpc.dwellir.com',
      'wss://phala.api.onfinality.io/public-ws',
    ],
    subscan: 'https://phala.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.BIFROST_POLKADOT]: {
    name: Chain.BIFROST_POLKADOT,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/bnc.svg'),
    parachainId: parachainIds.BIFROST_POLKADOT,
    endpoints: [
      'wss://hk.p.bifrost-rpc.liebi.com/ws',
      'wss://bifrost-polkadot.api.onfinality.io/public-ws',
    ],
    chopsticksEndpoint: 'ws://localhost:9947',
    subscan: 'https://bifrost.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.BIFROST_KUSAMA]: {
    name: Chain.BIFROST_KUSAMA,
    relayChain: Chain.KUSAMA,
    img: require('/src/assets/img/token/bnc.svg'),
    parachainId: parachainIds.BIFROST_KUSAMA,
    endpoints: [
      'wss://bifrost-rpc.liebi.com/ws',
      'wss://bifrost-rpc.dwellir.com',
      'wss://bifrost-parachain.api.onfinality.io/public-ws',
    ],
    subscan: 'https://bifrost-kusama.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.EQUILIBRIUM]: {
    name: Chain.EQUILIBRIUM,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/EQ.png'),
    parachainId: parachainIds.EQUILIBRIUM,
    endpoints: [
      'wss://equilibrium-rpc.dwellir.com',
      'wss://equilibrium.api.onfinality.io/public-ws',
    ],
    subscan: 'https://equilibrium.subscan.io',
    isAstarNativeToken: true,
  },
  [Chain.UNIQUE]: {
    name: Chain.UNIQUE,
    relayChain: Chain.POLKADOT,
    img: require('/src/assets/img/token/unq.svg'),
    parachainId: parachainIds.UNIQUE,
    endpoints: [
      'wss://ws.unique.network',
      'wss://unique.api.onfinality.io/public-ws',
      'wss://us-ws.unique.network',
      'wss://asia-ws.unique.network',
    ],
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

// Todo: ideally use a content management to manage it
export const restrictedXcmNetwork = {
  [astarChain.ASTAR]: [
    {
      chain: Chain.EQUILIBRIUM,
      isRestrictedFromNative: true,
      isRestrictedFromEvm: true,
    },
  ],
  [astarChain.SHIDEN]: [
    {
      chain: '',
      // chain: Chain.MOONRIVER,
      isRestrictedFromNative: false,
      isRestrictedFromEvm: true,
    },
  ],
  [astarChain.SHIBUYA]: [],
  [astarChain.DEVELOPMENT]: [],
  [astarChain.ROCSTAR]: [],
  [astarChain.ASTAR_ZKEVM]: [],
  [astarChain.ZKATANA]: [],
};

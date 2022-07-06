import { endpointKey } from 'src/config/chainEndpoints';
import { parachainIds } from 'src/config/xcmChainEndpoints';

export { xcmToken } from './tokens';
export {
  getXcmToken,
  fetchXcmBalance,
  fetchExistentialDeposit,
  checkIsFromRelayChain,
} from './utils';
export interface XcmTokenInformation {
  symbol: string;
  assetId: string;
  logo: string;
  isNativeToken: boolean;
  isXcmCompatible: boolean;
}

export type XcmNetworkIdx = endpointKey.ASTAR | endpointKey.SHIDEN | endpointKey.SHIBUYA;

export interface ExistentialDeposit {
  amount: string;
  chain: string;
  symbol: string;
  // Memo: minimum balance keeps in relaychain
  originChainMinBal: number;
}

// Ref: RPC calls -> system -> chain()
export enum Chain {
  Polkadot = 'Polkadot',
  Astar = 'Astar',
  Kusama = 'Kusama',
  Shiden = 'Shiden',
  Karura = 'Karura',
  Acala = 'Acala',
}

export interface XcmChain {
  name: Chain;
  relayChain: Chain;
  img: string;
  parachainId: parachainIds;
}

export const xcmChains: XcmChain[] = [
  {
    name: Chain.Polkadot,
    relayChain: Chain.Polkadot,
    img: require('/src/assets/img/ic_polkadot.png'),
    parachainId: 0,
  },
  {
    name: Chain.Astar,
    relayChain: Chain.Polkadot,
    img: require('/src/assets/img/ic_astar.png'),
    parachainId: parachainIds.ASTAR,
  },
  {
    name: Chain.Kusama,
    relayChain: Chain.Kusama,
    img: require('/src/assets/img/ic_kusama.png'),
    parachainId: 0,
  },
  {
    name: Chain.Shiden,
    relayChain: Chain.Kusama,
    img: require('/src/assets/img/ic_shiden.png'),
    parachainId: parachainIds.SHIDEN,
  },
  {
    name: Chain.Karura,
    relayChain: Chain.Kusama,
    img: 'https://polkadot.js.org/apps/static/karura.6540c949..svg',
    parachainId: parachainIds.KARURA,
  },
  {
    name: Chain.Acala,
    relayChain: Chain.Polkadot,
    img: 'https://polkadot.js.org/apps/static/acala.696aa448..svg',
    parachainId: parachainIds.ACALA,
  },
];

export const relayChains = [Chain.Polkadot, Chain.Kusama];

export const parachains = [Chain.Karura];

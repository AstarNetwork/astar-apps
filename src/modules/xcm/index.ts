import { endpointKey } from 'src/config/chainEndpoints';

export { xcmToken } from './tokens';
export {
  getXcmToken,
  fetchXcmBalance,
  fetchExistentialDeposit,
  isFromRelayChain,
  getChains,
} from './utils';
export interface XcmTokenInformation {
  symbol: string;
  logo: string;
  isNativeToken: boolean;
  isXcmCompatible: boolean;
}

export type XcmNetworkIdx = endpointKey.ASTAR | endpointKey.SHIDEN | endpointKey.SHIBUYA;

export interface ExistentialDeposit {
  amount: string;
  chain: string;
  symbol: string;
}

// Ref: RPC calls -> system -> chain()
export enum Chain {
  Polkadot = 'Polkadot',
  Astar = 'Astar',
  Kusama = 'Kusama',
  Shiden = 'Shiden',
}

export interface XcmChain {
  name: Chain;
  relayChain: Chain;
  img: any;
}

export const xcmChains: XcmChain[] = [
  {
    name: Chain.Polkadot,
    relayChain: Chain.Polkadot,
    img: require('/src/assets/img/ic_polkadot.png'),
  },
  {
    name: Chain.Astar,
    relayChain: Chain.Polkadot,
    img: require('/src/assets/img/ic_astar.png'),
  },
  {
    name: Chain.Kusama,
    relayChain: Chain.Kusama,
    img: require('/src/assets/img/ic_kusama.png'),
  },
  {
    name: Chain.Shiden,
    relayChain: Chain.Kusama,
    img: require('/src/assets/img/ic_shiden.png'),
  },
];

export const relayChains = [Chain.Polkadot, Chain.Kusama];

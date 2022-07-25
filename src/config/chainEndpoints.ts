import { RegistryTypes } from '@polkadot/types/types';
import * as typeDefs from 'src/config/api/polkadot/registry-types';

interface ChainProvider {
  networkAlias: string;
  displayName: string;
  info?: string;
  endpoints: { name: string; endpoint: string }[];
  favicon: string;
  isSupportContract: boolean;
  prefix?: number; // Used in extrinsic transactions, also to determine if a network supports extensic transactions.
  typeDef: RegistryTypes;
  key: endpointKey;
  isStoreEnabled: boolean;
  subscan: string;
  blockscout: string;
  evmChainId: string;
  evmEndpoints: string[];
  faucetEndpoint: string;
  defaultLogo?: any;
}

export enum astarChain {
  SHIBUYA = 'Shibuya Testnet',
  SHIDEN = 'Shiden',
  ASTAR = 'Astar',
  DEVELOPMENT = 'Development',
}

export type ASTAR_CHAIN = astarChain.SHIDEN | astarChain.ASTAR | astarChain.SHIBUYA;
export type ASTAR_NATIVE_TOKEN = 'ASTR' | 'SDN' | 'SBY';
export type ASTAR_NETWORK_IDX = endpointKey.ASTAR | endpointKey.SHIDEN | endpointKey.SHIBUYA;
export type ASTAR_EVM_NETWORK_IDX = 592 | 336 | 81;

export enum endpointKey {
  ASTAR = 0,
  SHIDEN = 1,
  SHIBUYA = 2,
  LOCAL = 3,
  CUSTOM = 4,
}

export const providerEndpoints: ChainProvider[] = [
  {
    networkAlias: 'astar',
    displayName: 'Astar Network',
    info: 'Smart contract platform for decentralized applications (dapps) on the Polkadot network',
    endpoints: [
      { name: 'Astar', endpoint: 'wss://wss.astar.network' },
      { name: 'OnFinality', endpoint: 'wss://astar.api.onfinality.io/public-ws' },
      { name: 'Dwellir', endpoint: 'wss://astar-rpc.dwellir.com' },
    ],
    favicon: 'https://polkadot.js.org/apps/static/astar.b48435e0.png',
    isSupportContract: true,
    prefix: 0x250,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.ASTAR,
    isStoreEnabled: true,
    subscan: 'https://astar.subscan.io',
    blockscout: 'https://blockscout.com/astar',
    evmChainId: '592',
    evmEndpoints: ['https://evm.astar.network', 'https://astar.api.onfinality.io/public'],
    faucetEndpoint: 'https://astar-discord-faucet.herokuapp.com/astar',
    defaultLogo: require('/src/assets/img/ic_astar.png'),
  },
  {
    networkAlias: 'shiden',
    displayName: 'Shiden Network',
    info: 'Smart contract platform for decentralized applications (dapps) on the Kusama network',
    endpoints: [
      { name: 'Shiden', endpoint: 'wss://rpc.shiden.astar.network' },
      { name: 'OnFinality', endpoint: 'wss://shiden.api.onfinality.io/public-ws' },
      { name: 'Pinknode', endpoint: 'wss://rpc.pinknode.io/shiden/explorer' },
      { name: 'Dwellir', endpoint: 'wss://shiden-rpc.dwellir.com' },
    ],
    favicon: 'icons/shiden.png',
    isSupportContract: true,
    prefix: 0x150,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.SHIDEN,
    isStoreEnabled: true,
    subscan: 'https://shiden.subscan.io',
    blockscout: 'https://blockscout.com/shiden',
    evmChainId: '336',
    evmEndpoints: ['https://evm.shiden.astar.network', 'https://shiden.api.onfinality.io/public'],
    faucetEndpoint: 'https://astar-discord-faucet.herokuapp.com/shiden',
    defaultLogo: require('/src/assets/img/ic_shiden.png'),
  },
  {
    networkAlias: 'shibuya-testnet',
    displayName: 'Shibuya Network',
    info: 'The test network of the layer 2 scaling blockchain',
    endpoints: [
      { name: 'Shibuya', endpoint: 'wss://rpc.shibuya.astar.network' },
      { name: 'Dwellir', endpoint: 'wss://shibuya-rpc.dwellir.com' },
    ],
    favicon: 'https://polkadot.js.org/apps/static/shiden.a066789e.png',
    isSupportContract: true,
    prefix: 0xff51,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.SHIBUYA,
    isStoreEnabled: true,
    subscan: 'https://shibuya.subscan.io',
    blockscout: 'https://blockscout.com/shibuya',
    evmChainId: '81',
    evmEndpoints: ['https://evm.shibuya.astar.network'],
    faucetEndpoint: 'https://astar-discord-faucet.herokuapp.com/shibuya',
    defaultLogo: require('/src/assets/img/ic_shibuya.png'),
  },
  {
    networkAlias: 'local-node',
    displayName: 'Local Network',
    endpoints: [{ name: 'Local Network', endpoint: 'ws://127.0.0.1:9944' }],
    favicon: 'icons/astar.png',
    isSupportContract: true,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.LOCAL,
    isStoreEnabled: true,
    subscan: '',
    blockscout: '',
    evmChainId: '',
    evmEndpoints: [''],
    faucetEndpoint: '',
  },
  {
    networkAlias: 'custom-node',
    displayName: 'Custom Network',
    endpoints: [{ name: '', endpoint: '' }],
    favicon: 'icons/astar.png',
    isSupportContract: true,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.CUSTOM,
    isStoreEnabled: true,
    subscan: '',
    blockscout: '',
    evmChainId: '',
    evmEndpoints: [''],
    faucetEndpoint: '',
  },
];

// Memo: return the provider index for Local and Custom node
export const getProviderIndex = (chain: ASTAR_CHAIN) => {
  switch (chain) {
    case 'Astar':
      return endpointKey.ASTAR;
    case 'Shiden':
      return endpointKey.SHIDEN;

    default:
      return endpointKey.SHIBUYA;
  }
};

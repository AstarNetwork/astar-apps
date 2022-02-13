import { RegistryTypes } from '@polkadot/types/types';
import * as typeDefs from 'src/config/api/polkadot/registry-types';

interface ChainProvider {
  networkAlias: string;
  displayName: string;
  info?: string;
  endpoint: string;
  fallback?: string;
  favicon: string;
  isSupportContract: boolean;
  prefix?: number; // Used in extrinsic transactions, also to determine if a network supports extensic transactions.
  typeDef: RegistryTypes;
  key: endpointKey;
  isStoreEnabled: boolean;
  subscan: string;
  blockscout: string;
  evmChainId: string;
  evmRpc: string;
  faucetEndpoint: string;
}

export type ASTAR_CHAIN = 'Shiden' | 'Astar' | 'Shibuya Testnet';

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
    displayName: 'Astar Network (Polkadot)',
    info: 'Smart contract platform for decentralized applications (dapps) on the Polkadot network',
    endpoint: 'wss://astar.api.onfinality.io/public-ws',
    favicon: 'https://polkadot.js.org/apps/static/astar.b48435e0.png',
    isSupportContract: true,
    prefix: 0x250,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.ASTAR,
    isStoreEnabled: true,
    subscan: 'https://astar.subscan.io',
    blockscout: 'https://blockscout.com/astar',
    evmChainId: '592',
    evmRpc: 'https://rpc.astar.network:8545',
    faucetEndpoint: 'https://astar-discord-faucet.herokuapp.com/astar',
  },
  {
    networkAlias: 'shiden-shell',
    displayName: 'Shiden Network (Kusama)',
    info: 'Smart contract platform for decentralized applications (dapps) on the Kusama network',
    endpoint: 'wss://rpc.shiden.astar.network',
    favicon: 'icons/shiden.png',
    isSupportContract: true,
    prefix: 0x150,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.SHIDEN,
    isStoreEnabled: true,
    subscan: 'https://shiden.subscan.io',
    blockscout: 'https://blockscout.com/shiden',
    evmChainId: '336',
    evmRpc: 'https://rpc.shiden.astar.network:8545',
    faucetEndpoint: 'https://astar-discord-faucet.herokuapp.com/shiden',
  },
  {
    networkAlias: 'shibuya-testnet',
    displayName: 'Shibuya Network (Testnet)',
    info: 'The test network of the layer 2 scaling blockchain',
    endpoint: 'wss://rpc.shibuya.astar.network',
    favicon: 'https://polkadot.js.org/apps/static/shiden.a066789e.png',
    isSupportContract: true,
    prefix: 0xff51,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.SHIBUYA,
    isStoreEnabled: true,
    subscan: 'https://shibuya.subscan.io',
    blockscout: 'https://blockscout.com/shibuya',
    evmChainId: '81',
    evmRpc: 'https://rpc.shibuya.astar.network:8545',
    faucetEndpoint: 'https://astar-discord-faucet.herokuapp.com/shibuya',
  },
  {
    networkAlias: 'local-node',
    displayName: 'Local Network',
    endpoint: 'ws://127.0.0.1:9944',
    favicon: 'icons/astar.png',
    isSupportContract: true,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.LOCAL,
    isStoreEnabled: true,
    subscan: '',
    blockscout: '',
    evmChainId: '',
    evmRpc: '',
    faucetEndpoint: '',
  },
  {
    networkAlias: 'custom-node',
    displayName: 'Custom Network',
    endpoint: 'ws://127.0.0.1:9944',
    favicon: 'icons/astar.png',
    isSupportContract: true,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.CUSTOM,
    isStoreEnabled: true,
    subscan: '',
    blockscout: '',
    evmChainId: '',
    evmRpc: '',
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
    case 'Shibuya Testnet':
      return endpointKey.SHIBUYA;
    default:
      return endpointKey.ASTAR;
  }
};

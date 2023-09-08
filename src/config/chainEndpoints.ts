import { RegistryTypes } from '@polkadot/types/types';
import * as typeDefs from 'src/config/api/polkadot/registry-types';
import { ASTAR_CHAIN } from 'src/config/chain';

export interface ChainProvider {
  networkAlias: string;
  displayName: string;
  info?: string;
  endpoints: { name: string; endpoint: string }[];
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
  // Memo: using `require` occurs error in `yarn test`
  defaultLogo: string;
  // Memo: XVM transfer contracts address
  xvmErcTransferContract?: string;
}

export enum endpointKey {
  ASTAR = 0,
  SHIDEN = 1,
  SHIBUYA = 2,
  LOCAL = 3,
  CUSTOM = 4,
  ROCSTAR = 5,
}

export const providerEndpoints: ChainProvider[] = [
  {
    networkAlias: 'astar',
    displayName: 'Astar Network',
    info: 'Smart contract platform for decentralized applications (dapps) on the Polkadot network',
    endpoints: [
      { name: 'Astar', endpoint: 'wss://rpc.astar.network' },
      // { name: 'Dwellir', endpoint: 'wss://astar-rpc.dwellir.com' },
      { name: 'Blast', endpoint: 'wss://astar.public.blastapi.io' },
      { name: 'OnFinality', endpoint: 'wss://astar.api.onfinality.io/public-ws' },
      { name: 'RadiumBlock', endpoint: 'wss://astar.public.curie.radiumblock.co/ws' },
      { name: 'Light Client (experimental)', endpoint: 'light://substrate-connect/polkadot/astar' },
    ],
    isSupportContract: true,
    prefix: 0x250,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.ASTAR,
    isStoreEnabled: true,
    subscan: 'https://astar.subscan.io',
    blockscout: 'https://blockscout.com/astar',
    evmChainId: '592',
    evmEndpoints: [
      'https://evm.astar.network',
      'https://astar.public.blastapi.io',
      'https://astar.api.onfinality.io/public',
    ],
    faucetEndpoint: 'https://us-central1-facuet-bot.cloudfunctions.net/app/astar',
    defaultLogo:
      'https://github.com/AstarNetwork/astar-apps/blob/main/src/assets/img/chain/astar.png?raw=true',
  },
  {
    networkAlias: 'shiden',
    displayName: 'Shiden Network',
    info: 'Smart contract platform for decentralized applications (dapps) on the Kusama network',
    endpoints: [
      { name: 'Shiden', endpoint: 'wss://rpc.shiden.astar.network' },
      // { name: 'Dwellir', endpoint: 'wss://shiden-rpc.dwellir.com' },
      { name: 'Blast', endpoint: 'wss://shiden.public.blastapi.io' },
      { name: 'OnFinality', endpoint: 'wss://shiden.api.onfinality.io/public-ws' },
      { name: 'Light Client (experimental)', endpoint: 'light://substrate-connect/kusama/shiden' },
    ],
    isSupportContract: true,
    prefix: 0x150,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.SHIDEN,
    isStoreEnabled: true,
    subscan: 'https://shiden.subscan.io',
    blockscout: 'https://blockscout.com/shiden',
    evmChainId: '336',
    evmEndpoints: [
      'https://evm.shiden.astar.network',
      'https://shiden.public.blastapi.io',
      'https://shiden.api.onfinality.io/public',
    ],
    faucetEndpoint: 'https://us-central1-facuet-bot.cloudfunctions.net/app/shiden',
    defaultLogo:
      'https://github.com/AstarNetwork/astar-apps/blob/main/src/assets/img/chain/shiden.png?raw=true',
  },
  {
    networkAlias: 'shibuya-testnet',
    displayName: 'Shibuya Network',
    info: 'The test network of the layer 2 scaling blockchain',
    endpoints: [
      { name: 'Shibuya', endpoint: 'wss://rpc.shibuya.astar.network' },
      // { name: 'Dwellir', endpoint: 'wss://shibuya-rpc.dwellir.com' },
      { name: 'Blast', endpoint: 'wss://shibuya.public.blastapi.io/' },
      { name: 'Light Client (experimental)', endpoint: 'light://substrate-connect/tokyo/shibuya' },
    ],
    isSupportContract: true,
    prefix: 0xff51,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.SHIBUYA,
    isStoreEnabled: true,
    subscan: 'https://shibuya.subscan.io',
    blockscout: 'https://blockscout.com/shibuya',
    evmChainId: '81',
    evmEndpoints: ['https://evm.shibuya.astar.network', 'https://shibuya.public.blastapi.io'],
    faucetEndpoint: 'https://us-central1-facuet-bot.cloudfunctions.net/app/shibuya',
    defaultLogo:
      'https://github.com/AstarNetwork/astar-apps/blob/main/src/assets/img/chain/shibuya.png?raw=true',
    xvmErcTransferContract: 'ZdNJsZUK96jGxr8iRfT8xHXUi5iQ7XwL9qbyJkADPdH7C1U',
  },
  {
    networkAlias: 'development',
    displayName: 'Local Network',
    endpoints: [{ name: 'Local Network', endpoint: 'ws://127.0.0.1:9944' }],
    isSupportContract: true,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.LOCAL,
    isStoreEnabled: true,
    subscan: '',
    blockscout: '',
    evmChainId: '4369',
    evmEndpoints: ['http://127.0.0.1:9933'],
    faucetEndpoint: '',
    defaultLogo:
      'https://github.com/AstarNetwork/astar-apps/blob/main/src/assets/img/chain/shibuya.png?raw=true',
    // Memo: paste the contract addresses after deployed the contracts on the local network
    // xvmErcTransferContract: '',
  },
  {
    networkAlias: 'custom-node',
    displayName: 'Custom Network',
    endpoints: [{ name: '', endpoint: '' }],
    isSupportContract: true,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.CUSTOM,
    isStoreEnabled: true,
    subscan: '',
    blockscout: '',
    evmChainId: '',
    evmEndpoints: [''],
    faucetEndpoint: '',
    defaultLogo:
      'https://github.com/AstarNetwork/astar-apps/blob/main/src/assets/img/chain/shibuya.png?raw=true',
  },
  {
    networkAlias: 'rocstar',
    displayName: 'Rocstar',
    info: 'The test network of Rococo',
    endpoints: [{ name: 'Rocstar', endpoint: 'wss://rocstar.astar.network' }],
    isSupportContract: true,
    prefix: 0xff51,
    typeDef: typeDefs.plasmCollatorDefinitions,
    key: endpointKey.ROCSTAR,
    isStoreEnabled: true,
    subscan: '',
    blockscout: '',
    evmChainId: '692',
    evmEndpoints: ['https://rocstar.astar.network'],
    faucetEndpoint: '',
    defaultLogo:
      'https://github.com/AstarNetwork/astar-apps/blob/main/src/assets/img/chain/shibuya.png?raw=true',
    xvmErcTransferContract: 'ZdNJsZUK96jGxr8iRfT8xHXUi5iQ7XwL9qbyJkADPdH7C1U',
  },
];

// Memo: return the provider index for Local and Custom node
export const getProviderIndex = (chain: ASTAR_CHAIN) => {
  switch (chain.toLowerCase()) {
    case 'astar':
      return endpointKey.ASTAR;
    case 'shiden':
      return endpointKey.SHIDEN;
    case 'development':
      return endpointKey.LOCAL;
    case 'rocstar testnet':
      return endpointKey.ROCSTAR;
    default:
      return endpointKey.SHIBUYA;
  }
};

export const getNetworkName = (chain: endpointKey): string => {
  return providerEndpoints[chain].networkAlias;
};

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
  evmChainId: string;
  evmRpc: string;
  faucetEndpoint: string;
}

export enum endpointKey {
  // PLASM = 0,
  SHIDEN = 0,
  DUSTY = 1,
  SHIBUYA = 2,
  LOCAL = 3,
  CUSTOM = 4,
}

export const providerEndpoints: ChainProvider[] = [
  // {
  //   networkAlias: 'plasm-main',
  //   displayName: 'Plasm Network (Mainnet)',
  //   info: 'The main network of the layer 2 scaling blockchain, Plasm Network',
  //   endpoint: 'wss://rpc.plasmnet.io/',
  //   favicon: 'icons/astar.png',
  //   isSupportContract: false,
  //   typeDef: typeDefs.plasmDefinitions,
  //   key: endpointKey.PLASM,
  //   isStoreEnabled: false,
  //   subScan: 'https://astar.subscan.io',
  //   evmChainId: ''
  // },
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
    evmChainId: '336',
    evmRpc: 'https://rpc.shiden.astar.network:8545',
    faucetEndpoint: 'https://astar-discord-faucet.herokuapp.com/shiden',
  },
  {
    networkAlias: 'dusty-testnet',
    displayName: 'Dusty Network (Testnet)',
    info: 'The test network of the layer 2 scaling blockchain, Dusty Plasm Network',
    endpoint: 'wss://dusty.astar.network',
    favicon: 'https://polkadot.js.org/apps/static/dusty.16cf115c.png',
    isSupportContract: true,
    typeDef: typeDefs.dustyDefinitions,
    key: endpointKey.DUSTY,
    isStoreEnabled: false,
    subscan: '',
    evmChainId: '',
    evmRpc: '',
    faucetEndpoint: '',
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
    evmChainId: '',
    evmRpc: '',
    faucetEndpoint: '',
  },
];

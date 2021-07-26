interface ChainProvider {
  networkAlias: string;
  displayName: string;
  info?: string;
  endpoint: string;
  fallback?: string;
  favicon: string;
  isSupportContract: boolean;
}

export enum endpointKey {
  PLASM = 0,
  SHIDEN = 1,
  DUSTY = 2,
  LOCAL = 3,
  CUSTOM = 4,
}

export const providerEndpoints: ChainProvider[] = [
  {
    networkAlias: 'plasm-main',
    displayName: 'Plasm Network (Mainnet)',
    info: 'The main network of the layer 2 scaling blockchain, Plasm Network',
    endpoint: 'wss://rpc.plasmnet.io/',
    favicon: 'favicon.png',
    isSupportContract: false,
  },
  {
    networkAlias: 'shiden-shell',
    displayName: 'Shiden Network (Kusama)',
    info:
      'Smart contract platform for decentralized applications (dapps) on the Kusama network',
    endpoint: 'wss://rpc.shiden.plasmnet.io',
    fallback: 'wss://shiden.api.onfinality.io/public-ws',
    favicon: 'img/shiden.png',
    isSupportContract: false,
  },
  {
    networkAlias: 'dusty-testnet',
    displayName: 'Dusty Network (Testnet)',
    info:
      'The test network of the layer 2 scaling blockchain, Dusty Plasm Network',
    endpoint: 'wss://rpc.dusty.plasmnet.io/',
    favicon: 'https://polkadot.js.org/apps/static/dusty.16cf115c.png',
    isSupportContract: true,
  },
  {
    networkAlias: 'local-node',
    displayName: 'Local Network',
    endpoint: 'ws://127.0.0.1:9944',
    favicon: 'favicon.png',
    isSupportContract: true,
  },
  {
    networkAlias: 'custom-node',
    displayName: 'Custom Network',
    endpoint: 'ws://127.0.0.1:9944',
    favicon: 'favicon.png',
    isSupportContract: true,
  },
];

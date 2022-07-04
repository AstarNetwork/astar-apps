export interface SubstrateChainProvider {
  networkAlias: string;
  displayName: string;
  endpoint: string;
}

export const PREFIX_ASTAR = 5;

export enum endpointKey {
  POLKADOT = 0,
  KUSAMA = 1,
}

// Todo: reconnect or change the WSS endpoint whenever it disconnected
export const providerEndpoints: SubstrateChainProvider[] = [
  {
    networkAlias: 'Polkadot',
    displayName: 'Polkadot Network',
    // endpoint: 'wss://rpc.polkadot.io',
    endpoint: 'wss://polkadot.api.onfinality.io/public-ws',
  },
  {
    networkAlias: 'kusama',
    displayName: 'Kusama Network',
    endpoint: 'wss://kusama-rpc.polkadot.io',
  },
  {
    networkAlias: 'Karura',
    displayName: 'Karura Network',
    endpoint: 'wss://karura.api.onfinality.io/public-ws',
  },
  {
    networkAlias: 'Acala',
    displayName: 'Acala Network',
    endpoint: 'wss://acala-polkadot.api.onfinality.io/public-ws',
  },
];

export enum parachainIds {
  ASTAR = 2006,
  SHIDEN = 2007,
  KARURA = 2000,
  ACALA = 2000,
}

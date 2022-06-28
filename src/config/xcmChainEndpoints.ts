interface ChainProvider {
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
export const providerEndpoints: ChainProvider[] = [
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
];

export enum parachainIds {
  ASTAR = 2006,
  SDN = 2007,
}

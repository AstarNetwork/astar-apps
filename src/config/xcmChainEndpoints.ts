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

export const providerEndpoints: ChainProvider[] = [
  {
    networkAlias: 'Polkadot',
    displayName: 'Polkadot Network',
    endpoint: 'wss://rpc.polkadot.io',
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

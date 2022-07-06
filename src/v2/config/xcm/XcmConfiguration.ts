import { Endpoint } from '../types/Endpoint';

export const XcmConfiguration: Endpoint[] = [
  {
    networkAlias: 'Polkadot',
    displayName: 'Polkadot Network',
    endpoint: 'wss://rpc.polkadot.io',
  },
  {
    networkAlias: 'Kusama',
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

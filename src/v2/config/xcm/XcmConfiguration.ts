import { Chain, Endpoint } from '../types/Endpoint';

export const XcmConfiguration: Endpoint[] = [
  {
    networkAlias: Chain.Polkadot,
    displayName: 'Polkadot Network',
    endpoint: 'wss://rpc.polkadot.io',
  },
  {
    networkAlias: Chain.Kusama,
    displayName: 'Kusama Network',
    endpoint: 'wss://kusama-rpc.polkadot.io',
  },
  {
    networkAlias: Chain.Karura,
    displayName: 'Karura Network',
    endpoint: 'wss://karura.api.onfinality.io/public-ws',
    parachainId: 2000,
  },
  {
    networkAlias: Chain.Acala,
    displayName: 'Acala Network',
    endpoint: 'wss://acala-polkadot.api.onfinality.io/public-ws',
    parachainId: 2000,
  },
];

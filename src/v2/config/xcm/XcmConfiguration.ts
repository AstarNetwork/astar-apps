import { Chain, Network } from '../types/Network';

export const XcmConfiguration: Network[] = [
  {
    chain: Chain.Polkadot,
    displayName: 'Polkadot Network',
    endpoint: 'wss://rpc.polkadot.io',
  },
  {
    chain: Chain.Kusama,
    displayName: 'Kusama Network',
    endpoint: 'wss://kusama-rpc.polkadot.io',
  },
  {
    chain: Chain.Shiden,
    displayName: 'Shiden Network',
    endpoint: 'wss://shiden.api.onfinality.io/public-ws',
    parachainId: 2007,
  },
  {
    chain: Chain.Karura,
    displayName: 'Karura Network',
    endpoint: 'wss://karura.api.onfinality.io/public-ws',
    parachainId: 2000,
  },
  {
    chain: Chain.Acala,
    displayName: 'Acala Network',
    endpoint: 'wss://acala-polkadot.api.onfinality.io/public-ws',
    parachainId: 2000,
  },
  {
    chain: Chain.Moonriver,
    displayName: 'Moonriver Network',
    endpoint: 'wss://wss.api.moonriver.moonbeam.network',
    parachainId: 2023,
  },
  {
    chain: Chain.Moonbeam,
    displayName: 'Moonbeam Network',
    endpoint: 'wss://wss.api.moonbeam.network',
    parachainId: 2004,
  },
];

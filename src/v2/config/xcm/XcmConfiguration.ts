import { Chain } from 'src/modules/xcm';
import { Network } from '../types/Network';

export const XcmConfiguration: Network[] = [
  {
    chain: Chain.POLKADOT,
    displayName: 'Polkadot Network',
    endpoint: 'wss://rpc.polkadot.io',
  },
  {
    chain: Chain.KUSAMA,
    displayName: 'Kusama Network',
    endpoint: 'wss://kusama-rpc.polkadot.io',
  },
  {
    chain: Chain.SHIDEN,
    displayName: 'Shiden Network',
    endpoint: 'wss://shiden.api.onfinality.io/public-ws',
    parachainId: 2007,
  },
  {
    chain: Chain.KARURA,
    displayName: 'Karura Network',
    endpoint: 'wss://karura.api.onfinality.io/public-ws',
    parachainId: 2000,
  },
  {
    chain: Chain.ACALA,
    displayName: 'Acala Network',
    endpoint: 'wss://acala-polkadot.api.onfinality.io/public-ws',
    parachainId: 2000,
  },
  {
    chain: Chain.MOONRIVER,
    displayName: 'Moonriver Network',
    endpoint: 'wss://wss.api.moonriver.moonbeam.network',
    parachainId: 2023,
  },
  {
    chain: Chain.MOONBEAM,
    displayName: 'Moonbeam Network',
    endpoint: 'wss://wss.api.moonbeam.network',
    parachainId: 2004,
  },
];

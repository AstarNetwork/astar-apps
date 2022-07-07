import { AcalaXcmRepository, PolkadotXcmRepository } from 'src/v2/repositories/implementations';
import { Endpoint } from '../types/Endpoint';

export const XcmConfiguration: Endpoint[] = [
  {
    networkAlias: 'Polkadot',
    displayName: 'Polkadot Network',
    endpoint: 'wss://rpc.polkadot.io',
    repository: PolkadotXcmRepository,
  },
  {
    networkAlias: 'Kusama',
    displayName: 'Kusama Network',
    endpoint: 'wss://kusama-rpc.polkadot.io',
    repository: PolkadotXcmRepository,
  },
  {
    networkAlias: 'Karura',
    displayName: 'Karura Network',
    endpoint: 'wss://karura.api.onfinality.io/public-ws',
    repository: AcalaXcmRepository,
  },
  {
    networkAlias: 'Acala',
    displayName: 'Acala Network',
    endpoint: 'wss://acala-polkadot.api.onfinality.io/public-ws',
    repository: AcalaXcmRepository,
  },
];

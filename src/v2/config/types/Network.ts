import { Class } from './TypeMapping';

export enum Chain {
  Polkadot = 'Polkadot',
  Kusama = 'Kusama',
  Acala = 'Acala',
  Karura = 'Karura',
}

export type Network = {
  chain: Chain;
  displayName: string;
  endpoint: string;
  parachainId?: number;
};

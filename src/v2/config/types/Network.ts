import { Class } from './TypeMapping';

export enum Chain {
  Polkadot = 'Polkadot',
  Kusama = 'Kusama',
  Astar = 'Astar',
  Shiden = 'Shiden',
  Acala = 'Acala',
  Karura = 'Karura',
  Moonbeam = 'Moonbeam',
  Moonriver = 'Moonriver',
}

export type Network = {
  chain: Chain;
  displayName: string;
  endpoint: string;
  parachainId?: number;
};

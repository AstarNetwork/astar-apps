import { endpointKey } from 'src/config/chainEndpoints';

export enum astarChain {
  SHIBUYA = 'Shibuya Testnet',
  SHIDEN = 'Shiden',
  ASTAR = 'Astar',
  DEVELOPMENT = 'Development',
}

export type ASTAR_CHAIN =
  | astarChain.SHIDEN
  | astarChain.ASTAR
  | astarChain.SHIBUYA
  | astarChain.DEVELOPMENT;

export type ASTAR_NETWORK_IDX =
  | endpointKey.ASTAR
  | endpointKey.SHIDEN
  | endpointKey.SHIBUYA
  | endpointKey.LOCAL;

export type ASTAR_EVM_NETWORK_IDX = 592 | 336 | 81 | 4369;

export type ASTAR_NATIVE_TOKEN = 'ASTR' | 'SDN' | 'SBY' | 'LOC';
export const astarMainnetNativeToken: ASTAR_NATIVE_TOKEN[] = ['ASTR', 'SDN'];

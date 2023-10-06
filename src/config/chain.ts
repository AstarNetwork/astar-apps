import { endpointKey } from 'src/config/chainEndpoints';

export enum astarChain {
  SHIBUYA = 'Shibuya Testnet',
  SHIDEN = 'Shiden',
  ASTAR = 'Astar',
  DEVELOPMENT = 'Development',
  AKIBA = 'Akiba Testnet',
  ROCSTAR = 'Rocstar Testnet',
}

export type ASTAR_CHAIN =
  | astarChain.SHIDEN
  | astarChain.ASTAR
  | astarChain.SHIBUYA
  | astarChain.AKIBA
  | astarChain.DEVELOPMENT
  | astarChain.ROCSTAR;

export type ASTAR_NETWORK_IDX =
  | endpointKey.ASTAR
  | endpointKey.SHIDEN
  | endpointKey.SHIBUYA
  | endpointKey.AKIBA
  | endpointKey.LOCAL
  | endpointKey.ROCSTAR;

export type ASTAR_EVM_NETWORK_IDX = 592 | 336 | 81 | 4369 | 692 | 7759;

export type ASTAR_NATIVE_TOKEN = 'ASTR' | 'SDN' | 'SBY' | 'LOC' | 'RSTR' | 'ETH';
export const astarMainnetNativeToken: ASTAR_NATIVE_TOKEN[] = ['ASTR', 'SDN'];

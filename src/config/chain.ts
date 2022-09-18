import { endpointKey } from 'src/config/chainEndpoints';

export enum astarChain {
  SHIBUYA = 'Shibuya Testnet',
  SHIDEN = 'Shiden',
  ASTAR = 'Astar',
  DEVELOPMENT = 'Development',
}

export type ASTAR_CHAIN = astarChain.SHIDEN | astarChain.ASTAR | astarChain.SHIBUYA;

export type ASTAR_NATIVE_TOKEN = 'ASTR' | 'SDN' | 'SBY';

export type ASTAR_NETWORK_IDX = endpointKey.ASTAR | endpointKey.SHIDEN | endpointKey.SHIBUYA;

export type ASTAR_EVM_NETWORK_IDX = 592 | 336 | 81;

export const astarMainnetNativeToken: ASTAR_NATIVE_TOKEN[] = ['ASTR', 'SDN'];

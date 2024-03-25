import { endpointKey } from 'src/config/chainEndpoints';

export enum astarChain {
  SHIBUYA = 'Shibuya Testnet',
  SHIDEN = 'Shiden',
  ASTAR = 'Astar',
  DEVELOPMENT = 'Development',
  ASTAR_ZKEVM = 'Astar zkEVM',
  ZKYOTO = 'zKyoto Testnet',
  ROCSTAR = 'Rocstar Testnet',
}

export type ASTAR_CHAIN =
  | astarChain.SHIDEN
  | astarChain.ASTAR
  | astarChain.SHIBUYA
  | astarChain.ASTAR_ZKEVM
  | astarChain.ZKYOTO
  | astarChain.DEVELOPMENT
  | astarChain.ROCSTAR;

export type ASTAR_NETWORK_IDX =
  | endpointKey.ASTAR
  | endpointKey.SHIDEN
  | endpointKey.SHIBUYA
  | endpointKey.ASTAR_ZKEVM
  | endpointKey.ZKYOTO
  | endpointKey.LOCAL
  | endpointKey.ROCSTAR;

export type ASTAR_EVM_NETWORK_IDX = 592 | 336 | 81 | 4369 | 692 | 6038361 | 3776;

export type ASTAR_NATIVE_TOKEN = 'ASTR' | 'SDN' | 'SBY' | 'LOC' | 'RSTR' | 'ETH';
export const astarMainnetNativeToken: ASTAR_NATIVE_TOKEN[] = ['ASTR', 'SDN'];

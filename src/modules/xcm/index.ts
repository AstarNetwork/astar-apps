import { endpointKey } from 'src/config/chainEndpoints';

export { xcmToken } from './tokens';
export { getXcmToken, fetchXcmBalance } from './utils';
export interface XcmTokenInformation {
  symbol: string;
  logo: string;
  isNativeToken: boolean;
  isXcmCompatible: boolean;
}

export type XcmNetworkIdx = endpointKey.ASTAR | endpointKey.SHIDEN | endpointKey.SHIBUYA;

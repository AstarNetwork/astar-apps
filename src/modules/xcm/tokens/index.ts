import { endpointKey } from 'src/config/chainEndpoints';

export const xcmToken = {
  [endpointKey.ASTAR]: [
    {
      symbol: 'DOT',
      isNativeToken: true,
      assetId: '340282366920938463463374607431768211455',
      logo: require('/src/assets/img/ic_dot.png'),
      isXcmCompatible: true,
      minBridgeAmount: '1.1',
    },
  ],
  [endpointKey.SHIDEN]: [
    {
      symbol: 'KSM',
      isNativeToken: true,
      assetId: '340282366920938463463374607431768211455',
      logo: require('/src/assets/img/ic_kusama.png'),
      isXcmCompatible: true,
      minBridgeAmount: '0.1',
    },
  ],
  [endpointKey.SHIBUYA]: [],
};

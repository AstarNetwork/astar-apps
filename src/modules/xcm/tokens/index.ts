import { endpointKey } from 'src/config/chainEndpoints';

export const xcmToken = {
  [endpointKey.ASTAR]: [
    {
      symbol: 'DOT',
      isNativeToken: true,
      logo: require('/src/assets/img/ic_polkadot.png'),
      isXcmCompatible: true,
    },
  ],
  [endpointKey.SHIDEN]: [
    {
      symbol: 'KSM',
      isNativeToken: true,
      logo: require('/src/assets/img/ic_kusama.png'),
      isXcmCompatible: true,
    },
  ],
  [endpointKey.SHIBUYA]: [],
};

import { endpointKey } from 'src/config/chainEndpoints';

export const xcmToken = {
  [endpointKey.ASTAR]: [
    {
      symbol: 'DOT',
      isNativeToken: true,
      assetId: '340282366920938463463374607431768211455',
      destAssetId: '',
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
      destAssetId: '',
      logo: require('/src/assets/img/ic_kusama.png'),
      isXcmCompatible: true,
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'aUSD',
      isNativeToken: false,
      assetId: '18446744073709551616',
      destAssetId: '',
      logo: 'https://assets.coingecko.com/coins/images/25812/small/ezgif-1-f4612f5260.png?1653987299',
      isXcmCompatible: true,
      // Note: Not sure if we need this
      minBridgeAmount: '1',
    },
  ],
  [endpointKey.SHIBUYA]: [],
};

export const hrmpTokens = {
  [endpointKey.ASTAR]: [],
  [endpointKey.SHIDEN]: [
    {
      symbol: 'USDT',
      isNativeToken: false,
      parachainAssetId: '1984',
      assetId: '1984', // asset id in Shiden
      logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
      // Note: Not sure if we need this
      // minBridgeAmount: '0.1', Not sure if we need this
    },
  ],
  [endpointKey.SHIBUYA]: [],
};

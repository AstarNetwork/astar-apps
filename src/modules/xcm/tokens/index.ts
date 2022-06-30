import { endpointKey } from 'src/config/chainEndpoints';

export const xcmToken = {
  [endpointKey.ASTAR]: [
    {
      symbol: 'DOT',
      isNativeToken: true,
      assetId: '340282366920938463463374607431768211455',
      originAssetId: '',
      logo: require('/src/assets/img/ic_dot.png'),
      isXcmCompatible: true,
      originChain: 'Polkadot',
      minBridgeAmount: '1.1',
    },
  ],
  [endpointKey.SHIDEN]: [
    {
      symbol: 'KSM',
      isNativeToken: true,
      assetId: '340282366920938463463374607431768211455',
      originAssetId: '',
      logo: require('/src/assets/img/ic_kusama.png'),
      isXcmCompatible: true,
      originChain: 'Kusama',
      minBridgeAmount: '0.1',
    },
    {
      symbol: 'aUSD',
      isNativeToken: false,
      assetId: '18446744073709551616',
      originAssetId: 'KUSD',
      logo: 'https://assets.coingecko.com/coins/images/25812/small/ezgif-1-f4612f5260.png?1653987299',
      isXcmCompatible: true,
      originChain: 'Karura',
      minBridgeAmount: '0.0193',
    },
  ],
  [endpointKey.SHIBUYA]: [],
};

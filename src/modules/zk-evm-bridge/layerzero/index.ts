import { astarNativeTokenErcAddr } from 'src/modules/xcm';

export enum LayerZeroBridgeNetworkName {
  'AstarZk' = 'Astar zkEVM',
  'AstaEvm' = 'Astar EVM',
}

export enum LayerZeroId {
  'AstarZk' = 257,
  'AstaEvm' = 210,
}
export interface LayerZeroToken {
  symbol: string;
  name: string;
  oftBridgeContract: {
    [LayerZeroId.AstaEvm]: string;
    [LayerZeroId.AstarZk]: string;
  };
  tokenAddress: {
    [LayerZeroId.AstaEvm]: string;
    [LayerZeroId.AstarZk]: string;
  };
  decimals: {
    [LayerZeroId.AstaEvm]: number;
    [LayerZeroId.AstarZk]: number;
  };
  image: string;
}

export const LayerZeroTokens: LayerZeroToken[] = [
  {
    symbol: 'ASTR',
    name: 'Astar Token',
    oftBridgeContract: {
      [LayerZeroId.AstaEvm]: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
      [LayerZeroId.AstarZk]: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
    },
    tokenAddress: {
      [LayerZeroId.AstaEvm]: astarNativeTokenErcAddr,
      [LayerZeroId.AstarZk]: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
    },
    decimals: {
      [LayerZeroId.AstaEvm]: 18,
      [LayerZeroId.AstarZk]: 18,
    },
    image: 'https://assets.coingecko.com/coins/images/22617/standard/astr.png?1696521933',
  },
  {
    symbol: 'DOT',
    name: 'DOT Token',
    oftBridgeContract: {
      [LayerZeroId.AstaEvm]: '0x105C0F4a5Eae3bcb4c9Edbb3FD5f6b60FAcc3b36',
      [LayerZeroId.AstarZk]: '',
    },
    tokenAddress: {
      [LayerZeroId.AstaEvm]: '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
      [LayerZeroId.AstarZk]: '0x7Cb5d4D178d93D59ea0592abF139459957898a59',
    },
    decimals: {
      [LayerZeroId.AstaEvm]: 10,
      [LayerZeroId.AstarZk]: 18,
    },
    image: 'https://assets.coingecko.com/coins/images/22617/standard/astr.png?1696521933',
  },
];

import { astarNativeTokenErcAddr } from 'src/modules/xcm';

export const urlLayerZeroScan = 'https://layerzeroscan.com';

export const LayerZeroSlippage = 0.5;

export enum LayerZeroNetworkName {
  'AstarZk' = 'Astar zkEVM',
  'AstarEvm' = 'Astar EVM',
}

export enum LayerZeroId {
  'AstarZk' = 257,
  'AstarEvm' = 210,
}

export enum LayerZeroChainId {
  'AstarZk' = 3776,
  'Astar' = 592,
}

export const lzBridgeIcon = {
  [LayerZeroNetworkName.AstarEvm]: require('src/assets/img/chain/astar.png'),
  [LayerZeroNetworkName.AstarZk]: require('src/assets/img/chain/zkatana-logo.png'),
} as any;

export const lzBridgeChainId = {
  [LayerZeroNetworkName.AstarEvm]: LayerZeroChainId.Astar,
  [LayerZeroNetworkName.AstarZk]: LayerZeroChainId.AstarZk,
};

export const layerZeroId = {
  [LayerZeroNetworkName.AstarEvm]: LayerZeroId.AstarEvm,
  [LayerZeroNetworkName.AstarZk]: LayerZeroId.AstarZk,
};

export interface LayerZeroToken {
  symbol: string;
  name: string;
  oftBridgeContract: {
    [LayerZeroId.AstarEvm]: string;
    [LayerZeroId.AstarZk]: string;
  };
  tokenAddress: {
    [LayerZeroId.AstarEvm]: string;
    [LayerZeroId.AstarZk]: string;
  };
  decimals: {
    [LayerZeroId.AstarEvm]: number;
    [LayerZeroId.AstarZk]: number;
  };
  image: string;
  fromChainBalance?: number;
  toChainBalance?: number;
}

export const LayerZeroTokens: LayerZeroToken[] = [
  {
    symbol: 'ASTR',
    name: 'Astar Token',
    oftBridgeContract: {
      [LayerZeroId.AstarEvm]: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
      [LayerZeroId.AstarZk]: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
    },
    tokenAddress: {
      [LayerZeroId.AstarEvm]: astarNativeTokenErcAddr,
      [LayerZeroId.AstarZk]: '0xdf41220C7e322bFEF933D85D01821ad277f90172',
    },
    decimals: {
      [LayerZeroId.AstarEvm]: 18,
      [LayerZeroId.AstarZk]: 18,
    },
    image: require('/src/assets/img/token/astr.png'),
  },
  {
    symbol: 'DOT',
    name: 'DOT Token',
    oftBridgeContract: {
      [LayerZeroId.AstarEvm]: '0x105C0F4a5Eae3bcb4c9Edbb3FD5f6b60FAcc3b36',
      [LayerZeroId.AstarZk]: '0x7Cb5d4D178d93D59ea0592abF139459957898a59',
    },
    tokenAddress: {
      [LayerZeroId.AstarEvm]: '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
      [LayerZeroId.AstarZk]: '0x7Cb5d4D178d93D59ea0592abF139459957898a59',
    },
    decimals: {
      [LayerZeroId.AstarEvm]: 10,
      [LayerZeroId.AstarZk]: 18,
    },
    image: require('/src/assets/img/token/dot.png'),
  },
];

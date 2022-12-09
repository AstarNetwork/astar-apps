import { Asset } from 'src/v2/models';
import { Erc20Token, XvmAsset } from './../../modules/token';

export interface XcmAssets {
  assets: Asset[];
  ttlNativeXcmUsdAmount: number;
}
export interface XvmAssets {
  xvmAssets: XvmAsset[];
  ttlXvmUsdAmount: number;
}

export interface EvmAssets {
  assets: Erc20Token[];
  ttlEvmUsdAmount: number;
}

export interface AssetsStateInterface {
  assets: XcmAssets;
  xvmAssets: XvmAssets;
  evmAssets: EvmAssets;
}

function state(): AssetsStateInterface {
  return {
    assets: { assets: [], ttlNativeXcmUsdAmount: 0 },
    xvmAssets: { xvmAssets: [], ttlXvmUsdAmount: 0 },
    evmAssets: { assets: [], ttlEvmUsdAmount: 0 },
  };
}

export default state;

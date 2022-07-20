import { Asset } from 'src/v2/models';

export interface XcmAssets {
  assets: Asset[];
  ttlNativeXcmUsdAmount: number;
}

export interface AssetsStateInterface {
  assets: XcmAssets;
}

function state(): AssetsStateInterface {
  return {
    assets: { assets: [], ttlNativeXcmUsdAmount: 0 },
  };
}

export default state;

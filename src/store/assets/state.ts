import { Asset } from 'src/v2/models';

export interface AssetsStateInterface {
  assets: { assets: Asset[]; ttlNativeXcmUsdAmount: number };
}

function state(): AssetsStateInterface {
  return {
    assets: { assets: [], ttlNativeXcmUsdAmount: 0 },
  };
}

export default state;

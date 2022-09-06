import { Asset } from 'src/v2/models';
import { Erc20Token } from './../../modules/token/index';

export interface XcmAssets {
  assets: Asset[];
  ttlNativeXcmUsdAmount: number;
}

export interface EvmAssets {
  assets: Erc20Token[];
  ttlEvmUsdAmount: number;
}

export interface AssetsStateInterface {
  assets: XcmAssets;
  evmAssets: EvmAssets;
}

function state(): AssetsStateInterface {
  return {
    assets: { assets: [], ttlNativeXcmUsdAmount: 0 },
    evmAssets: { assets: [], ttlEvmUsdAmount: 0 },
  };
}

export default state;

import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';

export interface GeneralStateInterface {
  selectedToken: ChainAsset | null;
}

function state(): GeneralStateInterface {
  return {
    selectedToken: null,
  };
}

export default state;

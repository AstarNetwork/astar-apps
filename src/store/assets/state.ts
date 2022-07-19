import { Asset } from 'src/v2/models';

export interface AssetsStateInterface {
  assets: Asset[];
}

function state(): AssetsStateInterface {
  return {
    assets: [],
  };
}

export default state;

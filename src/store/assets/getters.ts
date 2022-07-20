import { Asset } from 'src/v2/models';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { AssetsStateInterface as State } from './state';

export interface AssetsGetters {
  getAllAssets(state: State): { assets: Asset[]; ttlNativeXcmUsdAmount: number };
}

const getters: GetterTree<State, StateInterface> & AssetsGetters = {
  // getAllAssets: (state) => Object.values(state.assets),
  getAllAssets: (state) => state.assets,
};

export default getters;

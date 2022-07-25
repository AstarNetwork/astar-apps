import { Asset } from 'src/v2/models';
import { MutationTree } from 'vuex';
import { AssetsStateInterface as State, XcmAssets } from './state';

export interface AssetsMutations<S = State> {
  setAssets(state: S, payload: XcmAssets): void;
}

const mutations: MutationTree<State> & AssetsMutations = {
  setAssets(state: State, payload: XcmAssets) {
    state.assets = payload;
  },
};

export default mutations;

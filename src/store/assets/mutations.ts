import { Asset } from 'src/v2/models';
import { MutationTree } from 'vuex';
import { AssetsStateInterface as State } from './state';

export interface AssetsMutations<S = State> {
  setAssets(state: S, payload: { assets: Asset[]; ttlNativeXcmUsdAmount: number }): void;
}

const mutations: MutationTree<State> & AssetsMutations = {
  setAssets(state: State, payload: { assets: Asset[]; ttlNativeXcmUsdAmount: number }) {
    state.assets = payload;
  },
};

export default mutations;

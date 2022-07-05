import { Asset } from 'src/v2/models';
import { MutationTree } from 'vuex';
import { AssetsStateInterface as State } from './state';

export interface AssetsMutations<S = State> {
  setAssets(state: S, payload: Asset[]): void;
}

const mutations: MutationTree<State> & AssetsMutations = {
  setAssets(state: State, payload: Asset[]) {
    state.assets = payload;
  },
};

export default mutations;

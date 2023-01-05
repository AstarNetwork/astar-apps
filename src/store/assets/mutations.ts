import { MutationTree } from 'vuex';
import { AssetsStateInterface as State, XcmAssets, EvmAssets, XvmAssets } from './state';
export interface AssetsMutations<S = State> {
  setAssets(state: S, payload: XcmAssets): void;
  setXvmAssets(state: S, payload: XvmAssets): void;
  setEvmAssets(state: S, payload: EvmAssets): void;
}

const mutations: MutationTree<State> & AssetsMutations = {
  setAssets(state: State, payload: XcmAssets) {
    state.assets = payload;
  },
  setXvmAssets(state: State, payload: XvmAssets) {
    state.xvmAssets = payload;
  },
  setEvmAssets(state: State, payload: EvmAssets) {
    state.evmAssets = payload;
  },
};

export default mutations;

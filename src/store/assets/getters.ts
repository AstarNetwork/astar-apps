import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { AssetsStateInterface as State, XcmAssets, XvmAssets, EvmAssets } from './state';
export interface AssetsGetters {
  getAllAssets(state: State): XcmAssets;
  getAllXvmAssets(state: State): XvmAssets;
  getEvmAllAssets(state: State): EvmAssets;
}

const getters: GetterTree<State, StateInterface> & AssetsGetters = {
  getAllAssets: (state) => state.assets,
  getAllXvmAssets: (state) => state.xvmAssets,
  getEvmAllAssets: (state) => state.evmAssets,
};

export default getters;

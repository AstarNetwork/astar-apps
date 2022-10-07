import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { AssetsStateInterface as State, XcmAssets, EvmAssets } from './state';
export interface AssetsGetters {
  getAllAssets(state: State): XcmAssets;
  getEvmAllAssets(state: State): EvmAssets;
}

const getters: GetterTree<State, StateInterface> & AssetsGetters = {
  getAllAssets: (state) => state.assets,
  getEvmAllAssets: (state) => state.evmAssets,
};

export default getters;

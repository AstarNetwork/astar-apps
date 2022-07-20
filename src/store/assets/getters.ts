import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { AssetsStateInterface as State, XcmAssets } from './state';

export interface AssetsGetters {
  getAllAssets(state: State): XcmAssets;
}

const getters: GetterTree<State, StateInterface> & AssetsGetters = {
  getAllAssets: (state) => state.assets,
};

export default getters;

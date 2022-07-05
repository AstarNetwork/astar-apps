import { Asset } from 'src/v2/models';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { AssetsStateInterface as State } from './state';

export interface AssetsGetters {
  getAllAssets(state: State): Asset[];
}

const getters: GetterTree<State, StateInterface> & AssetsGetters = {
  getAllAssets: (state) => Object.values(state.assets),
};

export default getters;

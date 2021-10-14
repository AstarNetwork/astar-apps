import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { DappStateInterface as State, DappItem } from './state';

export interface ContractsGetters {
  getAllDapps(state: State): DappItem[];
}

const getters: GetterTree<State, StateInterface> & ContractsGetters = {
  getAllDapps: (state) => Object.values(state.dapps),
};

export default getters;

import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { DappStateInterface as State, DappItem } from './state';

export interface ContractsGetters {
  getAllDapps(state: State): DappItem[];
  getMinimumStakingAmount(state: State): string;
  getMaxNumberOfStakersPerContract(state: State): number;
}

const getters: GetterTree<State, StateInterface> & ContractsGetters = {
  getAllDapps: (state) => Object.values(state.dapps),
  getMinimumStakingAmount: (state) => state.minimumStakingAmount,
  getMaxNumberOfStakersPerContract: (state) => state.maxNumberOfStakersPerContract,
};

export default getters;

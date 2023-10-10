import { GetterTree } from 'vuex';
import { DappStakingState } from './state';
import { StateInterface } from 'src/store';

export interface DappStakingGetters {
  getVersion(state: DappStakingState): string;
}

const getters: GetterTree<DappStakingState, StateInterface> & DappStakingGetters = {
  getVersion: (state) => state.version,
};

export default getters;

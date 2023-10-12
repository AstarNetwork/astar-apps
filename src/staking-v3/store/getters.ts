import { GetterTree } from 'vuex';
import { CombinedDappInfo, DappStakingState } from './state';
import { StateInterface } from 'src/store';
import { DappBase } from '../logic';

export interface DappStakingGetters {
  getVersion(state: DappStakingState): string;
  getDapps(state: DappStakingState): CombinedDappInfo[];
  getDappsBasic(state: DappStakingState): DappBase[];
}

const getters: GetterTree<DappStakingState, StateInterface> & DappStakingGetters = {
  getVersion: (state) => state.version,
  getDapps: (state) => state.dapps,
  getDappsBasic: (state) => state.dapps.map((d) => d.basic),
};

export default getters;

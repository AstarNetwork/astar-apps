import { GetterTree } from 'vuex';
import { CombinedDappInfo, DappStakingState } from './state';
import { StateInterface } from 'src/store';
import { DappBase, ProtocolState } from '../logic';

export interface DappStakingGetters {
  getVersion(state: DappStakingState): string;
  getDapps(state: DappStakingState): CombinedDappInfo[];
  getDappsBasic(state: DappStakingState): DappBase[];
  getProtocolState(state: DappStakingState): ProtocolState | undefined;
}

const getters: GetterTree<DappStakingState, StateInterface> & DappStakingGetters = {
  getVersion: (state) => state.version,
  getDapps: (state) => state.dapps,
  getDappsBasic: (state) => state.dapps.map((d) => d.basic),
  getProtocolState: (state) => state.protocolState,
};

export default getters;

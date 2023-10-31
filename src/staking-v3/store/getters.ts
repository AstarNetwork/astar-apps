import { GetterTree } from 'vuex';
import { DappStakingState } from './state';
import { StateInterface } from 'src/store';
import { CombinedDappInfo, DappState, ProtocolState } from '../logic';

export interface DappStakingGetters {
  getVersion(state: DappStakingState): string;
  getDapps(state: DappStakingState): CombinedDappInfo[];
  getRegisteredDapps(state: DappStakingState): CombinedDappInfo[];
  getProtocolState(state: DappStakingState): ProtocolState | undefined;
}

const getters: GetterTree<DappStakingState, StateInterface> & DappStakingGetters = {
  getVersion: (state) => state.version,
  getDapps: (state) => state.dapps,
  getRegisteredDapps: (state) => state.dapps.filter((x) => x.chain.state === DappState.Registered),
  getProtocolState: (state) => state.protocolState,
};

export default getters;

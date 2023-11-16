import { GetterTree } from 'vuex';
import { DappStakingState } from './state';
import { StateInterface } from 'src/store';
import {
  AccountLedger,
  CombinedDappInfo,
  DappState,
  ProtocolState,
  SingularStakingInfo,
  Rewards,
  Constants,
} from '../logic';

export interface DappStakingGetters {
  getVersion(state: DappStakingState): string;
  getDapps(state: DappStakingState): CombinedDappInfo[];
  getRegisteredDapps(state: DappStakingState): CombinedDappInfo[];
  getProtocolState(state: DappStakingState): ProtocolState | undefined;
  getLedger(state: DappStakingState): AccountLedger | undefined;
  getStakeInfo(state: DappStakingState): Map<string, SingularStakingInfo> | undefined;
  getRewards(state: DappStakingState): Rewards | undefined;
  getConstants(state: DappStakingState): Constants | undefined;
}

const getters: GetterTree<DappStakingState, StateInterface> & DappStakingGetters = {
  getVersion: (state) => state.version,
  getDapps: (state) => state.dapps,
  getRegisteredDapps: (state) => state.dapps.filter((x) => x.chain.state === DappState.Registered),
  getProtocolState: (state) => state.protocolState,
  getLedger: (state) => state.ledger,
  getStakeInfo: (state) => state.stakerInfo,
  getRewards: (state) => state.rewards,
  getConstants: (state) => state.constants,
};

export default getters;

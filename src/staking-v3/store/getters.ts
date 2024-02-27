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
  EraInfo,
  DAppTierRewards,
  TiersConfiguration,
  EraLengths,
  DappInfo,
} from '../logic';

export interface DappStakingGetters {
  getVersion(state: DappStakingState): string;
  getDapps(state: DappStakingState): CombinedDappInfo[];
  getNewDapps(state: DappStakingState): DappInfo[];
  getRegisteredDapps(state: DappStakingState): CombinedDappInfo[];
  getProtocolState(state: DappStakingState): ProtocolState | undefined;
  getLedger(state: DappStakingState): AccountLedger | undefined;
  getStakeInfo(state: DappStakingState): Map<string, SingularStakingInfo> | undefined;
  getRewards(state: DappStakingState): Rewards | undefined;
  getConstants(state: DappStakingState): Constants | undefined;
  getCurrentEraInfo(state: DappStakingState): EraInfo | undefined;
  getDappTiers(state: DappStakingState): DAppTierRewards;
  getTiersConfiguration(state: DappStakingState): TiersConfiguration;
  getEraLengths(state: DappStakingState): EraLengths;
  getLeaderboard(state: DappStakingState): Map<number, number>;
}

const getters: GetterTree<DappStakingState, StateInterface> & DappStakingGetters = {
  getVersion: (state) => state.version,
  getDapps: (state) => state.dapps,
  getNewDapps: (state) => state.newDapps,
  getNumberOfStakersAndLockers: (state) => state.numberOfStakersAndLockers,
  getRegisteredDapps: (state) => state.dapps.filter((x) => x.chain.state === DappState.Registered),
  getProtocolState: (state) => state.protocolState,
  getLedger: (state) => state.ledger,
  getStakeInfo: (state) => state.stakerInfo,
  getRewards: (state) => state.rewards,
  getConstants: (state) => state.constants,
  getCurrentEraInfo: (state) => state.currentEra,
  getDappTiers: (state) => state.dAppTiers,
  getTiersConfiguration: (state) => state.tiersConfiguration,
  getEraLengths: (state) => state.eraLengths,
  getLeaderboard: (state) => state.leaderboard,
};

export default getters;

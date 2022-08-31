import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo, StakerInfo } from 'src/v2/models/DappsStaking';
import { MutationTree } from 'vuex';
import { DappStateInterface as State, DappItem } from './state';

export interface ContractsMutations<S = State> {
  addDapp(state: S, payload: DappItem): void;
  addDappCombinedInfos(state: S, payload: DappCombinedInfo[]): void;
  setMinimumStakingAmount(state: S, payload: string): void;
  setMaxNumberOfStakersPerContract(state: S, payload: number): void;
  setClaimedRewardsAmount(state: S, payload: number): void;
}

const mutation: MutationTree<State> & ContractsMutations = {
  addDapp(state: State, payload: DappItem) {
    // state.dapps.push(payload);
  },

  addDappCombinedInfos(state: State, payload: DappCombinedInfo[]) {
    state.dappsCombinedInfo = payload;
  },

  setMinimumStakingAmount(state: State, payload: string) {
    state.minimumStakingAmount = payload;
  },

  setMaxNumberOfStakersPerContract(state: State, payload: number) {
    state.maxNumberOfStakersPerContract = payload;
  },

  setClaimedRewardsAmount(state: State, payload: number) {
    state.claimedRewards = payload;
  },

  setUnbondingPeriod(state: State, payload: number) {
    state.unbondingPeriod = payload;
  },

  setMaxUnlockingChunks(state: State, payload: number) {
    state.maxUnlockingChunks = payload;
  },

  setUnlockingChunks(state: State, payload: number) {
    state.unlockingChunks = payload;
  },

  setIsPalletDisabled(state: State, payload: boolean) {
    state.isPalletDisabled = payload;
  },

  setTvl(state: State, payload: TvlModel) {
    state.tvl = payload;
  },

  setCurrentEra(state: State, currentEra: number) {
    state.currentEra = currentEra;
  },
};

export default mutation;

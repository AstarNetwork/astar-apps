import { TvlModel } from 'src/v2/models';
import { MutationTree } from 'vuex';
import { DappStateInterface as State, DappItem } from './state';

export interface ContractsMutations<S = State> {
  addDapps(state: S, payload: DappItem[]): void;
  addDapp(state: S, payload: DappItem): void;
  setMinimumStakingAmount(state: S, payload: string): void;
  setMaxNumberOfStakersPerContract(state: S, payload: number): void;
  setClaimedRewardsAmount(state: S, payload: number): void;
}

const mutation: MutationTree<State> & ContractsMutations = {
  addDapps(state: State, payload: DappItem[]) {
    state.dapps = payload;
  },

  addDapp(state: State, payload: DappItem) {
    state.dapps.push(payload);
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
};

export default mutation;

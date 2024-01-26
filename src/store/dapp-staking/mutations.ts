import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { MutationTree } from 'vuex';
import { DappStateInterface as State } from './state';
import { DappItem } from '@astar-network/astar-sdk-core';

export interface ContractsMutations<S = State> {
  addDapp(state: S, payload: DappItem): void;
  updateDapp(state: S, payload: DappItem): void;
  addDappCombinedInfos(state: S, payload: DappCombinedInfo[]): void;
  setMinimumStakingAmount(state: S, payload: string): void;
  setMaxNumberOfStakersPerContract(state: S, payload: number): void;
  setClaimedRewardsAmount(state: S, payload: number): void;
  setDecommission(state: S, payload: boolean): void;
}

const mutation: MutationTree<State> & ContractsMutations = {
  addDappCombinedInfos(state: State, payload: DappCombinedInfo[]) {
    state.dappsCombinedInfo = payload;
  },

  addDapp(state: State, payload: DappItem) {
    // Update existing dapp or add a new if doesn't exist.
    let dappIndex = state.dapps.findIndex((x) => x.address === payload.address);
    if (dappIndex !== -1) {
      state.dapps[dappIndex] = payload;
    } else {
      state.dapps.push(payload);
    }

    state.dapps = [...state.dapps];
  },

  updateDapp(state: State, payload: DappItem) {
    let dappIndex = state.dappsCombinedInfo.findIndex(
      (x) => x.dapp?.address.toLowerCase() === payload.address.toLocaleLowerCase()
    );
    if (dappIndex !== -1) {
      state.dappsCombinedInfo[dappIndex].dapp = payload;
    }
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

  setDecommission(state: State, payload: boolean) {
    state.decommission = payload;
  },
};

export default mutation;

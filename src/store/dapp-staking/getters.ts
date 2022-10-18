import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo, SmartContractState, StakerInfo } from 'src/v2/models/DappsStaking';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { DappStateInterface as State, DappItem } from './state';

export interface ContractsGetters {
  getAllDapps(state: State): DappCombinedInfo[];
  getRegisteredDapps(state: State): (tag: string) => DappCombinedInfo[];
  getMinimumStakingAmount(state: State): string;
  getMaxNumberOfStakersPerContract(state: State): number;
  getUnbondingPeriod(state: State): number;
  getMaxUnlockingChunks(state: State): number;
  getUnlockingChunks(state: State): number;
  getIsPalletDisabled(state: State): boolean;
  getClaimedRewards(state: State): number;
  getTvl(state: State): TvlModel;
  getCurrentEra(state: State): number;
}

const getters: GetterTree<State, StateInterface> & ContractsGetters = {
  getAllDapps: (state) => Object.values(state.dappsCombinedInfo),
  getRegisteredDapps: (state) => (tag) =>
    tag
      ? state.dappsCombinedInfo.filter(
          (x) => x.dapp?.tags?.includes(tag) && x.contract.state === SmartContractState.Registered
        )
      : state.dappsCombinedInfo,
  getMinimumStakingAmount: (state) => state.minimumStakingAmount,
  getMaxNumberOfStakersPerContract: (state) => state.maxNumberOfStakersPerContract,
  getUnbondingPeriod: (state) => state.unbondingPeriod,
  getMaxUnlockingChunks: (state) => state.maxUnlockingChunks,
  getUnlockingChunks: (state) => state.unlockingChunks,
  getIsPalletDisabled: (state) => state.isPalletDisabled,
  getClaimedRewards: (state) => state.claimedRewards,
  getTvl: (state) => state.tvl,
  getCurrentEra: (state) => state.currentEra,
};

export default getters;

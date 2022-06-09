import { state } from '@polkadot/types/interfaces/definitions';
import { stat } from 'fs';
import { TvlModel } from 'src/v2/models';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { DappStateInterface as State, DappItem } from './state';

export interface ContractsGetters {
  getAllDapps(state: State): DappItem[];
  getMinimumStakingAmount(state: State): string;
  getMaxNumberOfStakersPerContract(state: State): number;
  getUnbondingPeriod(state: State): number;
  getMaxUnlockingChunks(state: State): number;
  getUnlockingChunks(state: State): number;
  getIsPalletDisabled(state: State): boolean;
  getClaimedRewards(state: State): number;
  getTvl(state: State): TvlModel;
}

const getters: GetterTree<State, StateInterface> & ContractsGetters = {
  getAllDapps: (state) => Object.values(state.dapps),
  getMinimumStakingAmount: (state) => state.minimumStakingAmount,
  getMaxNumberOfStakersPerContract: (state) => state.maxNumberOfStakersPerContract,
  getUnbondingPeriod: (state) => state.unbondingPeriod,
  getMaxUnlockingChunks: (state) => state.maxUnlockingChunks,
  getUnlockingChunks: (state) => state.unlockingChunks,
  getIsPalletDisabled: (state) => state.isPalletDisabled,
  getClaimedRewards: (state) => state.claimedRewards,
  getTvl: (state) => state.tvl,
};

export default getters;

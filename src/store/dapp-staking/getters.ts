import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo, SmartContractState, StakerInfo } from 'src/v2/models/DappsStaking';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { DappStateInterface as State } from './state';

export interface ContractsGetters {
  getAllDapps(state: State): DappCombinedInfo[];
  getRegisteredDapps(state: State): (tag: string) => DappCombinedInfo[];
  getStakerDapps(state: State): DappCombinedInfo[];
  getRegisteredDapps(state: State): (mainCategory: string) => DappCombinedInfo[];
  getMinimumStakingAmount(state: State): string;
  getMaxNumberOfStakersPerContract(state: State): number;
  getUnbondingPeriod(state: State): number;
  getMaxUnlockingChunks(state: State): number;
  getUnlockingChunks(state: State): number;
  getIsPalletDisabled(state: State): boolean;
  getClaimedRewards(state: State): number;
  getTvl(state: State): TvlModel;
  getCurrentEra(state: State): number;
  getDecommission(state: State): boolean;
}

const getters: GetterTree<State, StateInterface> & ContractsGetters = {
  getAllDapps: (state) => Object.values(state.dappsCombinedInfo),
  getRegisteredDapps: (state) => (mainCategory) =>
    mainCategory
      ? state.dappsCombinedInfo.filter((x) => {
          try {
            return (
              (x.dapp?.mainCategory === mainCategory ||
                (x.dapp?.mainCategory === undefined && mainCategory === 'others')) &&
              x.contract.state === SmartContractState.Registered
            );
          } catch (error) {
            return state.dappsCombinedInfo;
          }
        })
      : state.dappsCombinedInfo,
  getStakerDapps: (state) =>
    state.dappsCombinedInfo.filter((x) => !x.stakerInfo.accountStakingAmount.startsWith('0')),
  getMinimumStakingAmount: (state) => state.minimumStakingAmount,
  getMaxNumberOfStakersPerContract: (state) => state.maxNumberOfStakersPerContract,
  getUnbondingPeriod: (state) => state.unbondingPeriod,
  getMaxUnlockingChunks: (state) => state.maxUnlockingChunks,
  getUnlockingChunks: (state) => state.unlockingChunks,
  getIsPalletDisabled: (state) => state.isPalletDisabled,
  getClaimedRewards: (state) => state.claimedRewards,
  getTvl: (state) => state.tvl,
  getCurrentEra: (state) => state.currentEra,
  getDecommission: (state) => state.decommission,
};

export default getters;

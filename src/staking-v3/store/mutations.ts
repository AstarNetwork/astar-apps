import { MutationTree } from 'vuex';
import { CombinedDappInfo, DappStakingState } from './state';
import { Dapp } from '../logic';

export interface DappStakingMutations<S = DappStakingState> {
  addDapps(state: DappStakingState, dapps: CombinedDappInfo[]): void;
  addDapp(state: DappStakingState, dapp: CombinedDappInfo): void;
  updateDappExtended(state: DappStakingState, dapp: Dapp): void;
}

const mutations: MutationTree<DappStakingState> & DappStakingMutations = {
  addDapps(state, dapps) {
    state.dapps = dapps;
  },
  addDapp(state, dapp) {
    state.dapps.push(dapp);
  },
  updateDappExtended(state, dapp) {
    const dappToUpdate = state.dapps.find((x) => x.basic.address === dapp.address);

    if (dappToUpdate) {
      const index = state.dapps.indexOf(dappToUpdate);
      state.dapps.splice(index, 1, { ...dappToUpdate, extended: dapp });
    } else {
      console.warn(`Dapp with address ${dapp.address} not found in the store.`);
    }
  },
};

export default mutations;

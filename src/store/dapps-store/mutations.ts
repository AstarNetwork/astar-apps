import { MutationTree } from 'vuex';
import { DappStateInterface as State, DappItem } from './state';

export interface ContractsMutations<S = State> {
  addDapps(state: S, payload: DappItem[]): void;
  addDapp(state: S, payload: DappItem): void;
  setMinimumStakingAmount(state: S, payload: string): void;
  setMaxNumberOfStakersPerContract(state: S, payload: number): void;
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
};

export default mutation;

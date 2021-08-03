import { MutationTree } from 'vuex';
import { ContractsStateInterface as State } from './state';

export interface ContractsMutations<S = State> {
  addCode(state: S, json: any): void;
  removeCode(state: S, codeHash: string): void;
}

const mutation: MutationTree<State> & ContractsMutations = {
  addCode(state, newJson) {
    const jsonResult = JSON.parse(newJson);
    state.allCode[jsonResult.json.codeHash] = jsonResult;
  },
  removeCode(state, codeHash) {
    delete state.allCode[codeHash];
  },
};

export default mutation;

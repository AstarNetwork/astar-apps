import { SelectedToken } from 'src/c-bridge';
import { MutationTree } from 'vuex';
import { GeneralStateInterface as State } from './state';

export interface GeneralMutations<S = State> {
  setSelectedToken(state: S, selectedToken: SelectedToken | null): void;
}

const mutation: MutationTree<State> & GeneralMutations = {
  setSelectedToken(state, selectedToken) {
    state.selectedToken = selectedToken;
  },
};

export default mutation;

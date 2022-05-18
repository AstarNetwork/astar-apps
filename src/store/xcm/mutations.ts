import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { MutationTree } from 'vuex';
import { GeneralStateInterface as State } from './state';

export interface GeneralMutations<S = State> {
  setSelectedToken(state: S, selectedToken: ChainAsset | null): void;
}

const mutation: MutationTree<State> & GeneralMutations = {
  setSelectedToken(state, selectedToken) {
    state.selectedToken = selectedToken;
  },
};

export default mutation;

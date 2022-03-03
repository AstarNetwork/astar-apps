import { SelectedToken } from 'src/c-bridge';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { GeneralStateInterface as State } from './state';

export interface GeneralGetters {
  selectedToken(state: State): SelectedToken | null;
}

const getters: GetterTree<State, StateInterface> & GeneralGetters = {
  selectedToken: (state) => state.selectedToken,
};

export default getters;

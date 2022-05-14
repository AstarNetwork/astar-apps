import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { GeneralStateInterface as State } from './state';

export interface GeneralGetters {
  selectedToken(state: State): ChainAsset | null;
}

const getters: GetterTree<State, StateInterface> & GeneralGetters = {
  selectedToken: (state) => state.selectedToken,
};

export default getters;

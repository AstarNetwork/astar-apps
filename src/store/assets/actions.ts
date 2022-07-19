import { container } from 'src/v2/common';
import { IXcmService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { AssetsStateInterface as State } from './state';

const actions: ActionTree<State, StateInterface> = {
  async getAssets({ commit }, address: string): Promise<void> {
    //commit('setAssets', []);
    const xcmService = container.get<IXcmService>(Symbols.XcmService);
    const assets = await xcmService.getAssets(address);
    commit('setAssets', assets);
  },
};

export default actions;

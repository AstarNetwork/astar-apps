import { Module } from 'vuex';

import state from './state';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { DappStakingState } from './state';
import { StateInterface } from 'src/store';

const storeModule: Module<DappStakingState, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
};

export default storeModule;

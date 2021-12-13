import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { DappStateInterface as State } from './state';

import actions from './actions';
import mutations from './mutations';
import getters from './getters';

const storeModule: Module<State, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
};

export default storeModule;

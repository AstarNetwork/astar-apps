import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { DappStateInterface as State } from './state';

import actions from './actions';
import mutations from './mutations';

const storeModule: Module<State, StateInterface> = {
  namespaced: true,
  actions,
  mutations,
  state
};

export default storeModule;

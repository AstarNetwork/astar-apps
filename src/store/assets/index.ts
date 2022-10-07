import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { AssetsStateInterface as State } from './state';

import actions from './actions';
import mutations from './mutations';
import getters from './getters';

const assetsModule: Module<State, StateInterface> = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};

export default assetsModule;

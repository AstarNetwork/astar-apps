import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { ContractsStateInterface as State } from './state';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const contractsModule: Module<State, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
};

export default contractsModule;

import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { GeneralStateInterface as State } from './state';
import getters from './getters';
import mutations from './mutations';

const generalModule: Module<State, StateInterface> = {
  namespaced: true,
  getters,
  mutations,
  state,
};

export default generalModule;

import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { DappStateInterface as State } from './state';

const storeModule: Module<State, StateInterface> = {
  namespaced: true,
  state
};

export default storeModule;

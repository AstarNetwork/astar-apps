import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { DappStateInterface as State } from './state';

const actions: ActionTree<State, StateInterface> = {
  getDapps ({ commit }) {
    commit('setLoading', true);
    commit('addDapps', [
      {
        name: 'string1',
        icon: 'string2',
        description: 'string3',
        dappUrl: 'string4'
      }
    ]);
  }
};

export default actions;

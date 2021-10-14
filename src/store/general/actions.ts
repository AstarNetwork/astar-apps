import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { GeneralStateInterface as State } from './state';

const actions: ActionTree<State, StateInterface> = {
  showAlertMsg({ commit }, { msg, alertType }) {
    commit('setShowAlertMsg', true);
    commit('setAlertMsg', msg);
    commit('setAlertType', alertType);
    setTimeout(() => {
      commit('setShowAlertMsg', false);
    }, 3000);
  },
};

export default actions;

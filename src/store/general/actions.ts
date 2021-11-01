import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { GeneralStateInterface as State } from './state';

const toastTimeout = 5000;

const actions: ActionTree<State, StateInterface> = {
  showAlertMsg({ commit }, { msg, alertType }) {
    commit('setShowAlertMsg', true);
    commit('setAlertMsg', msg);
    commit('setAlertType', alertType);
    setTimeout(() => {
      commit('setShowAlertMsg', false);
    }, toastTimeout);
  },
};

export default actions;

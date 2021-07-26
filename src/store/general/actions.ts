import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { GeneralStateInterface as State } from './state';

const actions: ActionTree<State, StateInterface> = {
  showAlertMsg ({ commit }, { msg, alertType }) {
    commit('general/setShowAlertMsg', true);
    commit('general/setAlertMsg', msg);
    commit('general/setAlertType', alertType);
    setTimeout(() => {
      commit('general/setShowAlertMsg', false);
    }, 3000);
  }
};

export default actions;

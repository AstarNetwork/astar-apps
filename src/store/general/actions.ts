import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { AlertBox, GeneralStateInterface as State } from './state';

const actions: ActionTree<State, StateInterface> = {
  showAlertMsg({ commit }, { msg, alertType, txHash }) {
    const alert: AlertBox = {
      alertMsg: msg,
      alertType,
      txHash,
    };
    commit('pushAlertMsg', alert);

    setTimeout(() => {
      commit('removeAlertMsg', 0);
    }, 4000);
  },
  removeAlertMsg({ commit }, { index }) {
    commit('removeAlertMsg', index);
  },
  setLoading({ commit }, { result }: { result: boolean }) {
    commit('setLoading', result);
  },
};

export default actions;

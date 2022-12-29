import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { AlertBox, GeneralStateInterface as State } from './state';

const toastTimeout = 5000;

const actions: ActionTree<State, StateInterface> = {
  showAlertMsg({ commit }, { msg, alertType, txHash }) {
    // commit('setShowAlertMsg', true);
    // commit('setAlertMsg', msg);
    // commit('setAlertType', alertType);

    const alert: AlertBox = {
      showAlertMsg: true,
      alertMsg: msg,
      alertType,
      txHash,
    };
    commit('pushAlertMsg', alert);

    // setTimeout(() => {
    //   commit('setShowAlertMsg', false);
    // }, toastTimeout);
  },
  removeAlertMsg({ commit }, { index }) {
    commit('removeAlertMsg', index);
  },
  setLoading({ commit }, { result }: { result: boolean }) {
    commit('setLoading', result);
  },
};

export default actions;

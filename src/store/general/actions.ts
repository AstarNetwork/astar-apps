import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { AlertBox, GeneralStateInterface as State } from './state';

const actions: ActionTree<State, StateInterface> = {
  showAlertMsg({ commit }, { msg, alertType, explorerUrl }) {
    const alert: AlertBox = {
      alertMsg: msg,
      alertType,
      explorerUrl,
    };
    commit('pushAlertMsg', alert);

    setTimeout(() => {
      commit('removeAlertMsg', 0);
    }, 8000);
  },
  removeAlertMsg({ commit }, { index }) {
    commit('removeAlertMsg', index);
  },
  setLoading({ commit }, { result }: { result: boolean }) {
    commit('setLoading', result);
  },
};

export default actions;

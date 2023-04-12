import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { AlertBox, GeneralStateInterface as State } from './state';

const actions: ActionTree<State, StateInterface> = {
  showAlertMsg({ commit }, { msg, alertType, subscanUrl }) {
    const alert: AlertBox = {
      alertMsg: msg,
      alertType,
      subscanUrl,
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

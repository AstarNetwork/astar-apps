import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { DappStateInterface as State } from './state';

const actions: ActionTree<State, StateInterface> = {
  async getDapps ({ commit, dispatch }) {
    commit('general/setLoading', true, { root: true });

    // TODO service url in ENV
    const response = await fetch('https://localhost:5001/store', { method: 'GET' });

    try {
      const body = await response.json();
      commit('addDapps', body);

    } catch (e) {
      const error = e as unknown as Error; 
      dispatch('general/showAlertMsg', {
        msg: error.message,
        alertType: 'error'
      },
      { root: true });
    } finally {
      commit('general/setLoading', false, { root: true });
    }
  }
};

export default actions;

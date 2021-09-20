import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { DappItem, DappStateInterface as State, NewDappItem } from './state';
import { api as axios } from 'src/boot/axios';

// TODO service url in ENV
const apiUrl = 'https://localhost:5001/api/store';

const actions: ActionTree<State, StateInterface> = {
  async getDapps ({ commit, dispatch }) {
    commit('general/setLoading', true, { root: true });

    try {
      const resposne = await axios.get<DappItem[]>(apiUrl);
      commit('addDapps', resposne.data);
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
  },

  async registerDapp({ commit, dispatch }, dapp: NewDappItem): Promise<boolean> {
    commit('general/setLoading', true, { root: true });
    console.log('dapp', dapp);
    try {
      const resposne = await axios.post<DappItem>(apiUrl, dapp, {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        }
      });
      commit('addDapp', resposne.data);
      return true;
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

    return false;
  } 
};

export default actions;

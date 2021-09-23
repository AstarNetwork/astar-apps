import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { DappStateInterface as State, NewDappItem } from './state';
import { dappsCollection, getDocs, uploadFile, addDapp} from 'src/hooks/firebase';

const actions: ActionTree<State, StateInterface> = {
  async getDapps ({ commit, dispatch }) {
    commit('general/setLoading', true, { root: true });

    try {
      const collection = await getDocs(dappsCollection);
      commit('addDapps', collection.docs.map(x => x.data()));
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
    try {
      const fileName = `${dapp.address}_${dapp.iconFileName}`;
      dapp.iconUrl = await uploadFile(fileName, dapp.iconFile);
      const addedDapp = await addDapp(dapp);
      commit('addDapp', addedDapp);

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

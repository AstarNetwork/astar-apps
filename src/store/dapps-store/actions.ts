import { ActionTree } from 'vuex';
import { web3FromSource } from '@polkadot/extension-dapp';
import { StateInterface } from '../index';
import { DappStateInterface as State, NewDappItem } from './state';
import { dappsCollection, getDocs, uploadFile, addDapp} from 'src/hooks/firebase';
import { ApiPromise } from '@polkadot/api';

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

  async registerDapp({ commit, dispatch }, parameters: RegisterParameters): Promise<boolean> {
    commit('general/setLoading', true, { root: true });
    try {
      if (parameters.api) {
        const injector = await web3FromSource('polkadot-js');    
        await parameters.api.tx.dappsStaking
          .register(parseInt(parameters.dapp.address))
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer
            }
          );

        const fileName = `${parameters.dapp.address}_${parameters.dapp.iconFileName}`;
        parameters.dapp.iconUrl = await uploadFile(fileName, parameters.dapp.iconFile);
        const addedDapp = await addDapp(parameters.dapp);
        commit('addDapp', addedDapp);

        return true;
      } else {
        dispatch('general/showAlertMsg', {
          msg: 'Api is undefined',
          alertType: 'error'
        },
        { root: true });

        return false;
      }
    } catch (e) {
      const error = e as unknown as Error; 
      console.log(e);
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

export interface RegisterParameters {
  dapp: NewDappItem,
  api: ApiPromise,
  senderAddress: string
}

export default actions;

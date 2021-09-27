import { ActionTree, Dispatch } from 'vuex';
import { web3FromSource } from '@polkadot/extension-dapp';
import { StateInterface } from '../index';
import { DappItem, DappStateInterface as State, NewDappItem } from './state';
import { dappsCollection, getDocs, uploadFile, addDapp} from 'src/hooks/firebase';
import { ApiPromise } from '@polkadot/api';

const showError = (dispatch: Dispatch, message: string): void => {
  dispatch('general/showAlertMsg', {
    msg: message,
    alertType: 'error'
  },
  { root: true });
}

const actions: ActionTree<State, StateInterface> = {
  async getDapps ({ commit, dispatch }) {
    commit('general/setLoading', true, { root: true });

    try {
      const collection = await getDocs(dappsCollection);
      commit('addDapps', collection.docs.map(x => x.data()));
    } catch (e) {
      const error = e as unknown as Error; 
      showError(dispatch, error.message);
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
        
        dispatch('general/showAlertMsg', {
          msg: `You successfully registered dApp ${parameters.dapp.name} to the store.`,
          alertType: 'success',
        });

        return true;
      } else {
        showError(dispatch, 'Api is undefined.');

        return false;
      }
    } catch (e) {
      const error = e as unknown as Error; 
      showError(dispatch, error.message);
    } finally {
      commit('general/setLoading', false, { root: true });
    }

    return false;
  },
  
  async stake({ commit, dispatch }, parameters: StakingParameters): Promise<boolean> {
    commit('general/setLoading', true, { root: true });
    try {
      if (parameters.api) {
        const injector = await web3FromSource('polkadot-js');    
        await parameters.api.tx.dappsStaking
          .bondAndStake(parseInt(parameters.dapp.address), parameters.amount)
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer
            }
          );
        
        dispatch('general/showAlertMsg', {
          msg: `You staked ${parameters.amount} to ${parameters.dapp.name}.`,
          alertType: 'success',
        },
        { root: true });

        return true;
      } else {
        showError(dispatch, 'Api is undefined');
        return false;
      }
    } catch (e) {
      const error = e as unknown as Error; 
      showError(dispatch, error.message);
    } finally {
      commit('general/setLoading', false, { root: true });
    }

    return false;
  },

  async unstake({ commit, dispatch }, parameters: StakingParameters): Promise<boolean> {
    commit('general/setLoading', true, { root: true });
    try {
      if (parameters.api) {
        const injector = await web3FromSource('polkadot-js');    
        await parameters.api.tx.dappsStaking
          .unbondUnstakeAndWithdraw(parseInt(parameters.dapp.address), parameters.amount)
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer
            }
          );
        
        dispatch('general/showAlertMsg', {
          msg: `You unstaked ${parameters.amount} from ${parameters.dapp.name}.`,
          alertType: 'success',
        },
        { root: true });

        return true;
      } else {
        showError(dispatch, 'Api is undefined');
        return false;
      }
    } catch (e) {
      const error = e as unknown as Error; 
      showError(dispatch, error.message);
    } finally {
      commit('general/setLoading', false, { root: true });
    }

    return false;
  },

  async claim({ commit, dispatch }, parameters: StakingParameters): Promise<boolean> {
    commit('general/setLoading', true, { root: true });
    try {
      if (parameters.api) {
        const injector = await web3FromSource('polkadot-js');    
        await parameters.api.tx.dappsStaking
          .claim(parseInt(parameters.dapp.address))
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer
            }
          );
        
        dispatch('general/showAlertMsg', {
          msg: `You claimed from ${parameters.dapp.name}.`,
          alertType: 'success',
        },
        { root: true });

        return true;
      } else {
        showError(dispatch, 'Api is undefined');
        return false;
      }
    } catch (e) {
      const error = e as unknown as Error; 
      showError(dispatch, error.message);
    } finally {
      commit('general/setLoading', false, { root: true });
    }

    return false;
  }
};

export interface RegisterParameters {
  dapp: NewDappItem,
  senderAddress: string,
  api: ApiPromise,
}

export interface StakingParameters {
  dapp: DappItem,
  amount: number,
  senderAddress: string,
  api: ApiPromise
}

export default actions;

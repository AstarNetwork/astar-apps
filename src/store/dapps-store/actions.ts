import { ActionTree, Dispatch } from 'vuex';
import { web3FromSource } from '@polkadot/extension-dapp';
import { Option, Struct, BTreeMap } from '@polkadot/types';
import { EraIndex, AccountId, Balance } from '@polkadot/types/interfaces';
import BN from 'bn.js';
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

// TODO refactor, detect address type, etc.....
const getAddressEnum = (address:string) => (
  {'Evm': address}
);

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
          .register(getAddressEnum(parameters.dapp.address))
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
      console.log(error);
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
          .bondAndStake(getAddressEnum(parameters.dapp.address), parameters.amount)
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
          .unbondUnstakeAndWithdraw(getAddressEnum(parameters.dapp.address), parameters.amount)
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
          .claim(getAddressEnum(parameters.dapp.address))
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
  },

  async getStakeInfo({ dispatch }, parameters: StakingParameters): Promise<StakeInfo | undefined> {
    try {
      if (parameters.api) {
        const eraIndexPromise = await parameters.api
          .query
          .dappsStaking
          .contractLastStaked<Option<EraIndex>>(getAddressEnum(parameters.dapp.address))
        const eraIndex = await eraIndexPromise.unwrapOr(null);
        
        if (eraIndex) {
          const stakeInfoPromise = await parameters.api
            .query
            .dappsStaking
            .contractEraStake<Option<EraStakingPoints>>(getAddressEnum(parameters.dapp.address), eraIndex);
          const stakeInfo = await stakeInfoPromise.unwrapOr(null);
          
          if (stakeInfo) {
            // TODO find a way to utilize stakeInfo.stakers.get by providing AccountId as parameter
            let yourStake;
            stakeInfo.stakers.forEach((stake: Balance, account: AccountId) => {
                if (account.toString() === parameters.senderAddress) {
                  yourStake = stake.toHuman();
                  return;
                }
            });

            return {
              totalStake: stakeInfo.total.toHuman(),
              yourStake,
              hasStake: yourStake !== undefined
            } as StakeInfo;
          }
        }
      } else {
        showError(dispatch, 'Api is undefined.');
      }
    } catch (e) {
      // TODO check. There will me many calls to this method. Maybe is better not to show any popup.
      console.log(e);
    }
  }
};

export interface RegisterParameters {
  dapp: NewDappItem;
  senderAddress: string;
  api: ApiPromise;
}

export interface StakingParameters {
  dapp: DappItem;
  amount: BN;
  senderAddress: string;
  api: ApiPromise;
}

export interface StakeInfo {
  yourStake: string | undefined;
  totalStake: string;
  hasStake: boolean;
}

// TODO check why this type is not autogenerated.
// Maybe need to do the following https://polkadot.js.org/docs/api/examples/promise/typegen/
export interface EraStakingPoints extends Struct {
  readonly total: Balance;
  readonly stakers: BTreeMap<AccountId, Balance>;
}

export default actions;

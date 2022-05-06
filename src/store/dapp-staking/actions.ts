import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { bool, BTreeMap, Struct, u32 } from '@polkadot/types';
import {
  AccountId,
  Balance,
  DispatchError,
  EraIndex,
  EventRecord,
} from '@polkadot/types/interfaces';
import { ISubmittableResult, ITuple } from '@polkadot/types/types';
import BN from 'bn.js';
import { $api } from 'boot/api';
import { addDapp, getDapps, uploadFile } from 'src/hooks/firebase';
import { ActionTree, Dispatch } from 'vuex';
import { StateInterface } from '../index';
import { getInjector } from './../../hooks/helper/wallet';
import { SubstrateAccount } from './../general/state';
import { getIndividualClaimStakingInfo } from './calculation';
import { DappItem, DappStateInterface as State, NewDappItem } from './state';

let collectionKey: string;

const showError = (dispatch: Dispatch, message: string): void => {
  dispatch(
    'general/showAlertMsg',
    {
      msg: message,
      alertType: 'error',
    },
    { root: true }
  );
};

// TODO refactor, detect address type, etc.....
export const getAddressEnum = (address: string) => ({ Evm: address });

const getCollectionKey = async (): Promise<string> => {
  if (!collectionKey) {
    await $api?.value?.isReady;
    const chain = (await $api?.value?.rpc.system.chain()) || 'development-dapps';
    collectionKey = `${chain.toString().toLowerCase()}-dapps`.replace(' ', '-');
  }

  return collectionKey;
};

export const hasExtrinsicFailedEvent = (
  events: EventRecord[],
  dispatch: Dispatch,
  setMessage?: Function
): boolean => {
  let result = false;
  events
    .filter((record): boolean => !!record.event && record.event.section !== 'democracy')
    .map(({ event: { data, method, section } }) => {
      console.log('event', method, section, data);
      if (section === 'utility' && method === 'BatchInterrupted') {
        console.log(data.toHuman());
      }

      if (section === 'system' && method === 'ExtrinsicFailed') {
        const [dispatchError] = data as unknown as ITuple<[DispatchError]>;
        let message = dispatchError.type;

        if (dispatchError.isModule) {
          try {
            const mod = dispatchError.asModule;
            const error = dispatchError.registry.findMetaError(mod);

            message = `${error.section}.${error.name}`;
          } catch (error) {
            // swallow
            console.error(error);
          }
        } else if (dispatchError.isToken) {
          message = `${dispatchError.type}.${dispatchError.asToken.type}`;
        }

        if (setMessage) {
          setMessage(message);
        }

        showError(dispatch, `action: ${section}.${method} ${message}`);
        result = true;
      } else if (section === 'utility' && method === 'BatchInterrupted') {
        // TODO there should be a better way to extract error,
        // for some reason cast data as unknown as ITuple<[DispatchError]>; doesn't work
        const anyData = data as any;
        const error = anyData[1].registry.findMetaError(anyData[1].asModule);
        let message = `${error.section}.${error.name}`;
        showError(dispatch, `action: ${section}.${method} ${message}`);
        result = true;
      }
    });

  return result;
};

const actions: ActionTree<State, StateInterface> = {
  async getDapps({ commit, dispatch, rootState }) {
    commit('general/setLoading', true, { root: true });

    try {
      const collectionKey = await getCollectionKey();
      const collection = await getDapps(collectionKey);
      commit(
        'addDapps',
        collection.docs.map((x) => x.data())
      );
    } catch (e) {
      const error = e as unknown as Error;
      showError(dispatch, error.message);
    } finally {
      commit('general/setLoading', false, { root: true });
    }
  },

  async registerDapp(
    { commit, dispatch, rootState },
    parameters: RegisterParameters
  ): Promise<boolean> {
    try {
      if (parameters.api) {
        const injector = await getInjector(parameters.substrateAccounts);
        const unsub = await parameters.api.tx.dappsStaking
          .register(getAddressEnum(parameters.dapp.address))
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer,
              nonce: -1,
              tip: 1,
            },
            async (result) => {
              if (result.status.isFinalized) {
                if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
                  try {
                    const collectionKey = await getCollectionKey();
                    if (parameters.dapp.iconFileName) {
                      const fileName = `${parameters.dapp.address}_${parameters.dapp.iconFileName}`;
                      parameters.dapp.iconUrl = await uploadFile(
                        fileName,
                        collectionKey,
                        parameters.dapp.iconFile
                      );
                    } else {
                      parameters.dapp.iconUrl = '/images/noimage.png';
                    }

                    if (!parameters.dapp.url) {
                      parameters.dapp.url = '';
                    }

                    parameters.dapp.imagesUrl = [];
                    for (let i = 0; i < parameters.dapp.imagesContent.length; i++) {
                      const dappImage = parameters.dapp.imagesContent[i];
                      const dappImageUrl = await uploadFile(
                        `${parameters.dapp.address}_${i}_${parameters.dapp.images[i].name}`,
                        collectionKey,
                        dappImage
                      );
                      parameters.dapp.imagesUrl.push(dappImageUrl);
                    }

                    const addedDapp = await addDapp(collectionKey, parameters.dapp);
                    commit('addDapp', addedDapp);

                    dispatch(
                      'general/showAlertMsg',
                      {
                        msg: `You successfully registered dApp ${parameters.dapp.name} to the store.`,
                        alertType: 'success',
                      },
                      { root: true }
                    );
                  } catch (e) {
                    const error = e as unknown as Error;
                    console.log(error);
                    showError(dispatch, error.message);
                    alert(
                      `An unexpected error occured during dApp registration. Please screenshot this message and send to the Astar team. ${error.message}`
                    );
                  }
                }

                commit('general/setLoading', false, { root: true });
                unsub();
              } else {
                commit('general/setLoading', true, { root: true });
              }
            }
          );

        return true;
      } else {
        showError(dispatch, 'Api is undefined.');

        return false;
      }
    } catch (e) {
      const error = e as unknown as Error;
      console.log(error);
      commit('general/setLoading', false, { root: true });
      showError(dispatch, error.message);
    }

    return false;
  },

  async withdrawUnbonded({ commit, dispatch }, parameters: WithdrawParameters): Promise<boolean> {
    try {
      if (parameters.api) {
        const injector = await getInjector(parameters.substrateAccounts);
        const unsub = await parameters.api.tx.dappsStaking.withdrawUnbonded().signAndSend(
          parameters.senderAddress,
          {
            signer: injector?.signer,
            nonce: -1,
            tip: 1,
          },
          (result) => {
            if (result.status.isFinalized) {
              if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
                commit('setUnlockingChunks', -1);
                dispatch(
                  'general/showAlertMsg',
                  {
                    msg: 'Balance is sucessfully withdrawed.',
                    alertType: 'success',
                  },
                  { root: true }
                );
              }

              commit('general/setLoading', false, { root: true });
              unsub();
            } else {
              commit('general/setLoading', true, { root: true });
            }
          }
        );

        return true;
      } else {
        showError(dispatch, 'Api is undefined');
        return false;
      }
    } catch (e) {
      const error = e as unknown as Error;
      commit('general/setLoading', false, { root: true });
      showError(dispatch, error.message);
    } finally {
    }

    return false;
  },

  async claimBatch({ commit, dispatch }, parameters: ClaimParameters): Promise<boolean> {
    try {
      if (parameters.api) {
        const erasToClaim = parameters.unclaimedEras;

        if (erasToClaim.length === 0) {
          dispatch(
            'general/showAlertMsg',
            {
              msg: 'All rewards have been already claimed.',
              alertType: 'warning',
            },
            { root: true }
          );

          return true;
        }

        const transactions: SubmittableExtrinsic<'promise', ISubmittableResult>[] = [];
        for (let era of erasToClaim) {
          transactions.push(
            parameters.api.tx.dappsStaking.claim(getAddressEnum(parameters.dapp.address), era)
          );
        }

        const injector = await getInjector(parameters.substrateAccounts);
        const unsub = await parameters.api.tx.utility.batch(transactions).signAndSend(
          parameters.senderAddress,
          {
            signer: injector?.signer,
            nonce: -1,
            tip: 1,
          },
          (result) => {
            if (result.isFinalized) {
              if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
                dispatch(
                  'general/showAlertMsg',
                  {
                    msg: `You claimed from reward ${parameters.dapp.name} for ${erasToClaim.length} eras.`,
                    alertType: 'success',
                  },
                  { root: true }
                );

                parameters.finalizeCallback();
              }

              commit('general/setLoading', false, { root: true });
              unsub();
            } else {
              commit('general/setLoading', true, { root: true });
            }
          }
        );

        return true;
      } else {
        showError(dispatch, 'Api is undefined');
        return false;
      }
    } catch (e) {
      const error = e as unknown as Error;
      commit('general/setLoading', false, { root: true });
      showError(dispatch, error.message);
    }

    return false;
  },

  async getClaimInfo({ dispatch, commit }, parameters: StakingParameters): Promise<ClaimInfo> {
    let accumulatedReward = new BN(0);
    let result: ClaimInfo = {} as ClaimInfo;
    result.rewards = parameters.api.createType('Balance', accumulatedReward);
    result.estimatedClaimedRewards = parameters.api.createType('Balance', 0);
    commit('general/setLoading', true, { root: true });

    try {
      result = await getIndividualClaimStakingInfo(
        parameters.senderAddress,
        parameters.dapp.address
      );
    } catch (err) {
      const error = err as unknown as Error;
      console.error(error);
      showError(dispatch, error.message);
    } finally {
      commit('general/setLoading', false, { root: true });
      return result;
    }
  },

  async getStakingInfo({ commit, dispatch, rootState }) {
    await $api?.value?.isReady;
    try {
      if ($api?.value) {
        const [
          minimumStakingAmount,
          maxNumberOfStakersPerContract,
          maxUnlockingChunks,
          unbondingPeriod,
        ] = await Promise.all([
          $api.value.consts.dappsStaking.minimumStakingAmount,
          $api.value.consts.dappsStaking.maxNumberOfStakersPerContract as u32,
          $api.value.consts.dappsStaking.maxUnlockingChunks as u32,
          $api.value.consts.dappsStaking.unbondingPeriod as u32,
        ]);

        const minimumStakingAmountBalance = $api?.value?.createType(
          'Balance',
          minimumStakingAmount
        );
        commit('setMinimumStakingAmount', minimumStakingAmountBalance?.toHuman());
        commit('setMaxNumberOfStakersPerContract', maxNumberOfStakersPerContract?.toNumber());
        commit('setUnbondingPeriod', unbondingPeriod?.toNumber());
        commit('setMaxUnlockingChunks', maxUnlockingChunks?.toNumber());
        let isPalletDisabled = false;
        try {
          const isDisabled = await $api.value.query.dappsStaking.palletDisabled<bool>();
          isPalletDisabled = isDisabled.valueOf();
        } catch {
          // palletDisabled storage item is not supported by a node;
        }

        commit('setIsPalletDisabled', isPalletDisabled);
      }
    } catch (e) {
      const error = e as unknown as Error;
      showError(dispatch, error.message);
    }
  },
};

export interface RegisterParameters {
  dapp: NewDappItem;
  senderAddress: string;
  api: ApiPromise;
  substrateAccounts: SubstrateAccount[];
}

export interface StakingParameters {
  dapp: DappItem;
  amount: BN;
  senderAddress: string;
  api: ApiPromise;
  decimals: number;
  unit: string;
  substrateAccounts: SubstrateAccount[];
  finalizeCallback: () => void;
}

export interface ClaimParameters extends StakingParameters {
  unclaimedEras: number[];
  substrateAccounts: SubstrateAccount[];
}

export interface WithdrawParameters {
  api: ApiPromise;
  senderAddress: string;
  substrateAccounts: SubstrateAccount[];
}

export interface StakeInfo {
  yourStake:
    | undefined
    | {
        formatted: string;
        denomAmount: BN;
      };
  totalStake: string;
  claimedRewards: string;
  hasStake: boolean;
  stakersCount: number;
  dappAddress?: string;
}

export interface ClaimInfo {
  rewards: BN;
  estimatedClaimedRewards: BN;
  unclaimedEras: number[];
}

// TODO check why this type is not autogenerated.
// Maybe need to do the following https://polkadot.js.org/docs/api/examples/promise/typegen/
export interface EraStakingPoints extends Struct {
  readonly total: Balance;
  readonly stakers: BTreeMap<AccountId, Balance>;
  readonly formerStakedEra: EraIndex;
  readonly claimedRewards: Balance;
  readonly numberOfStakers: BN;
}

export interface EraRewardAndStake extends Struct {
  readonly rewards: Balance;
  readonly staked: Balance;
  readonly locked: Balance;
}

export default actions;

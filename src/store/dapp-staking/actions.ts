import { ApiPromise } from '@polkadot/api';
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
import { signAndSend } from './../../hooks/helper/wallet';
import { SubstrateAccount } from './../general/state';
import { DappStateInterface as State, NewDappItem } from './state';
import { IDappStakingService } from 'src/v2/services';
import container from 'src/v2/app.container';
import { Symbols } from 'src/v2/symbols';

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
    await $api?.isReady;
    const chain = (await $api?.rpc.system.chain()) || 'development-dapps';
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
      // console.log('event', method, section, data);
      // if (section === 'utility' && method === 'BatchInterrupted') {
      //   console.log(data.toHuman());
      // }

      if (section === 'system' && method === 'ExtrinsicFailed') {
        const [dispatchError] = data as unknown as ITuple<[DispatchError]>;
        let message = dispatchError.type.toString();

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
  async getDapps({ commit, dispatch, rootState }, network: string) {
    commit('general/setLoading', true, { root: true });

    try {
      const collection = await getDapps(network.toLowerCase());
      commit('addDapps', collection);
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
        const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
          return new Promise<boolean>(async (resolve) => {
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

                  resolve(true);
                } catch (e) {
                  const error = e as unknown as Error;
                  console.error(error);
                  showError(dispatch, error.message);
                  alert(
                    `An unexpected error occured during dApp registration. Please screenshot this message and send to the Astar team. ${error.message}`
                  );
                  resolve(false);
                }
              }

              commit('general/setLoading', false, { root: true });
            } else {
              commit('general/setLoading', true, { root: true });
            }
          });
        };

        const transaction = parameters.api.tx.dappsStaking.register(
          getAddressEnum(parameters.dapp.address)
        );
        await signAndSend({
          transaction,
          senderAddress: parameters.senderAddress,
          substrateAccounts: parameters.substrateAccounts,
          isCustomSignature: false,
          txResHandler,
          dispatch,
          tip: parameters.tip,
        });

        return true;
      } else {
        showError(dispatch, 'Api is undefined.');
        return false;
      }
    } catch (e) {
      const error = e as unknown as Error;
      console.error(error);
      commit('general/setLoading', false, { root: true });
      showError(dispatch, error.message);
    }

    return false;
  },

  async getStakingInfo({ commit, dispatch, rootState }) {
    await $api?.isReady;

    try {
      if ($api) {
        const [
          minimumStakingAmount,
          maxNumberOfStakersPerContract,
          maxUnlockingChunks,
          unbondingPeriod,
        ] = await Promise.all([
          $api.consts.dappsStaking.minimumStakingAmount,
          $api.consts.dappsStaking.maxNumberOfStakersPerContract as u32,
          $api.consts.dappsStaking.maxUnlockingChunks as u32,
          $api.consts.dappsStaking.unbondingPeriod as u32,
        ]);

        const minimumStakingAmountBalance = $api?.createType('Balance', minimumStakingAmount);
        commit('setMinimumStakingAmount', minimumStakingAmountBalance?.toHuman());
        commit('setMaxNumberOfStakersPerContract', maxNumberOfStakersPerContract?.toNumber());
        commit('setUnbondingPeriod', unbondingPeriod?.toNumber());
        commit('setMaxUnlockingChunks', maxUnlockingChunks?.toNumber());
        let isPalletDisabled = false;
        try {
          const isDisabled = await $api.query.dappsStaking.palletDisabled<bool>();
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

  async getTvl({ commit, dispatch }) {
    try {
      const dappService = container.get<IDappStakingService>(Symbols.DappStakingService);
      const tvl = await dappService.getTvl();
      commit('setTvl', tvl);

      return tvl;
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
  tip: string;
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
  isRegistered: boolean;
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

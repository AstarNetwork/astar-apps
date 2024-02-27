import { ApiPromise } from '@polkadot/api';
import { bool, BTreeMap, Struct, u32 } from '@polkadot/types';
import {
  AccountId,
  Balance,
  DispatchError,
  EraIndex,
  EventRecord,
} from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { $api } from 'boot/api';
import { ActionTree, Dispatch } from 'vuex';
import { StateInterface } from '../index';
import { SubstrateAccount } from './../general/state';
import { DappStateInterface as State, NewDappItem, FileInfo } from './state';
import { IAccountUnificationService, IDappStakingService } from 'src/v2/services';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import axios, { AxiosError } from 'axios';
import type { Transaction } from 'src/hooks/helper/wallet';
import { TOKEN_API_URL, DappItem, isValidEvmAddress } from '@astar-network/astar-sdk-core';
import { IDappStakingServiceV2V3 } from 'src/staking-v3';

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

export const hasExtrinsicFailedEvent = (
  events: EventRecord[],
  dispatch: Dispatch,
  setMessage?: Function
): boolean => {
  let result = false;
  events
    .filter((record): boolean => !!record.event && record.event.section !== 'democracy')
    .map(({ event: { data, method, section } }) => {
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
  async getDapps(
    { commit, dispatch },
    { network, senderSs58Account }: { network: string; senderSs58Account: string }
  ) {
    const accountUnificationService = container.get<IAccountUnificationService>(
      Symbols.AccountUnificationService
    );

    try {
      // Fetch dapps
      const dappsUrl = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/dappssimple`;
      const service = container.get<IDappStakingService>(Symbols.DappStakingService);
      const address = isValidEvmAddress(senderSs58Account)
        ? await accountUnificationService.getMappedNativeAddress(senderSs58Account)
        : senderSs58Account;
      const [dapps, combinedInfo] = await Promise.all([
        axios.get<DappItem[]>(dappsUrl),
        service.getCombinedInfo(address),
      ]);

      // Update combined info with dapp info
      combinedInfo.map((i) => {
        i.dapp = dapps.data.find(
          (x) => x.address.toLowerCase() === i.contract.address.toLowerCase()
        );
      });

      commit('addDappCombinedInfos', combinedInfo);
    } catch (e) {
      const error = e as unknown as Error;
      showError(dispatch, error.message);
    } finally {
      // commit('general/setLoading', false, { root: true });
    }
  },

  async registerDappApi({ commit, dispatch }, parameters: RegisterParameters): Promise<boolean> {
    if (parameters.api) {
      try {
        const payload = {
          name: parameters.dapp.name,
          iconFile: getFileInfo(parameters.dapp.iconFileName, parameters.dapp.iconFile),
          address: parameters.dapp.address,
          url: parameters.dapp.url,
          images: getImagesInfo(parameters.dapp),
          developers: parameters.dapp.developers,
          description: parameters.dapp.description,
          shortDescription: parameters.dapp.shortDescription,
          communities: parameters.dapp.communities,
          contractType: parameters.dapp.contractType,
          mainCategory: parameters.dapp.mainCategory,
          license: parameters.dapp.license,
          tags: parameters.dapp.tags,
          senderAddress: parameters.senderAddress,
          signature: parameters.signature,
        };

        commit('general/setLoading', true, { root: true });
        const url = `${TOKEN_API_URL}/v1/${parameters.network.toLocaleLowerCase()}/dapps-staking/register`;
        const result = await axios.post(url, payload);

        commit('addDapp', result.data);

        dispatch(
          'general/showAlertMsg',
          {
            msg: `You successfully registered dApp ${parameters.dapp.name} to the store.`,
            alertType: 'success',
          },
          { root: true }
        );

        return true;
      } catch (e) {
        const error = e as unknown as AxiosError;
        console.error(error);
        showError(dispatch, error.response?.data);
        alert(
          `An unexpected error occured during dApp registration. Please screenshot this message and send to the Astar team. ${JSON.stringify(
            error.response?.data
          )}`
        );
        return false;
      } finally {
        commit('general/setLoading', false, { root: true });
      }
    } else {
      showError(dispatch, 'Api is undefined.');
      return false;
    }
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
        commit('setMinimumStakingAmount', minimumStakingAmountBalance?.toString());
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
      const dappService = container.get<IDappStakingServiceV2V3>(Symbols.DappStakingServiceV2V3);
      const tvl = await dappService.getTvl();
      commit('setTvl', tvl);

      return tvl;
    } catch (e) {
      console.error(e);
      const error = e as unknown as Error;
      showError(dispatch, error.message);
    }
  },
};

const getFileInfo = (fileName: string, dataUrl: string): FileInfo => {
  const urlParts = dataUrl.split(/[:;,]+/);

  return {
    name: fileName,
    base64content: urlParts[3],
    contentType: urlParts[1],
  };
};

const getImagesInfo = (dapp: NewDappItem): FileInfo[] => {
  return dapp.images
    .slice(1) // Ignore first image since it is just an add image placeholder.
    .map((image, index) => getFileInfo(image.name, dapp.imagesContent[index + 1]));
};

export interface RegisterParameters {
  dapp: NewDappItem;
  senderAddress: string;
  api: ApiPromise;
  substrateAccounts: SubstrateAccount[];
  tip: string;
  network: string;
  isCustomSignature: boolean;
  getCallFunc: (transaction: Transaction) => Promise<Transaction>;
  signature: string;
}

export interface WithdrawParameters {
  api: ApiPromise;
  senderAddress: string;
  substrateAccounts: SubstrateAccount[];
}

export interface MyStakeInfo {
  formatted: string;
  denomAmount: BN;
}

export interface StakeInfo {
  yourStake: undefined | MyStakeInfo;
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

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { BTreeMap, Option, Struct, u32 } from '@polkadot/types';
import {
  AccountId,
  Balance,
  DispatchError,
  EraIndex,
  EventRecord,
} from '@polkadot/types/interfaces';
import { ISubmittableResult, ITuple } from '@polkadot/types/types';
import { formatBalance } from '@polkadot/util';
import BN from 'bn.js';
import { $api } from 'boot/api';
import { addDapp, getDapps, uploadFile } from 'src/hooks/firebase';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { ActionTree, Dispatch } from 'vuex';
import { StateInterface } from '../index';
import { GeneralStakerInfo } from './../../hooks/helper/claim';
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

const getFormattedBalance = (parameters: StakingParameters): string => {
  return formatBalance(parameters.amount, {
    withSi: true,
    decimals: parameters.decimals,
    withUnit: parameters.unit,
  });
};

const getCollectionKey = async (): Promise<string> => {
  if (!collectionKey) {
    await $api?.value?.isReady;
    const chain = (await $api?.value?.rpc.system.chain()) || 'development-dapps';
    collectionKey = `${chain.toString().toLowerCase()}-dapps`.replace(' ', '-');
  }

  return collectionKey;
};

export const hasExtrinsicFailedEvent = (events: EventRecord[], dispatch: Dispatch): boolean => {
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

        if (message.includes('TooManyEraStakeValues')) {
          message = `${message} - Disable compounding, claim your rewards and than enable compounding again.`;
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

const getEraStakes = async (
  api: ApiPromise,
  contractAddress: string
): Promise<Map<number, Option<EraStakingPoints>>> => {
  const eraStakes = await api.query.dappsStaking.contractEraStake.entries<EraStakingPoints>(
    getAddressEnum(contractAddress)
  );

  let eraStakeMap = new Map();
  eraStakes.forEach(([key, stake]) => {
    eraStakeMap.set(Number(key.args.map((k) => k.toString())[1]), stake);
  });

  return eraStakeMap;
};

const getClaimableEraStakes = async (
  api: ApiPromise,
  contractAddress: string,
  currentEra: number,
  historyDepth: number
): Promise<Map<number, Option<EraStakingPoints>>> => {
  let eraStakeMap = new Map();
  const lowestEra = Math.max(currentEra - historyDepth, 1);
  for (let era = currentEra - 1; era >= lowestEra; era--) {
    const eraStake = await api.query.dappsStaking.contractEraStake<EraStakingPoints>(
      getAddressEnum(contractAddress),
      era
    );

    if (!eraStake.isEmpty) {
      eraStakeMap.set(era, eraStake);
    } else {
      break;
    }
  }

  return eraStakeMap;
};

const getLowestClaimableEra = (
  api: ApiPromise,
  currentEra: number,
  eraStakeMap: Map<number, Option<EraStakingPoints>>
) => {
  const historyDepth = Number(api.consts.dappsStaking.historyDepth.toString());
  const firstStakedEra = Math.min(...eraStakeMap.keys());
  const lowestClaimableEra = Math.max(firstStakedEra, Math.max(1, currentEra - historyDepth));

  return lowestClaimableEra;
};

const getErasToClaim = async (api: ApiPromise, contractAddress: string): Promise<number[]> => {
  const currentEra = await (await api.query.dappsStaking.currentEra<EraIndex>()).toNumber();

  const eraStakeMap = await getEraStakes(api, contractAddress);
  if (eraStakeMap.size === 0) {
    return [];
  }

  const lowestClaimableEra = getLowestClaimableEra(api, currentEra, eraStakeMap);
  const result: number[] = [];

  for (let era = lowestClaimableEra; era < currentEra; era++) {
    const info: EraStakingPoints | undefined = eraStakeMap.get(era)?.unwrap();
    if (info === undefined || info.claimedRewards.eq(new BN(0))) {
      result.push(era);
    }
  }

  console.log('Eras to claim', result);
  return result;
};

const getErasToClaim2 = (eraStakeMap: Map<number, Option<EraStakingPoints>>): number[] => {
  const result: number[] = [];
  eraStakeMap.forEach((map: Option<EraStakingPoints>, era: number) => {
    if (map.isNone || (map.isSome && map.unwrap().claimedRewards.eq(new BN(0)))) {
      result.push(era);
    }
  });

  console.log('Eras to claim', result);
  return result;
};

const getLatestStakePoint = async (
  api: ApiPromise,
  contract: string
): Promise<EraStakingPoints | undefined> => {
  const currentEra = await (await api.query.dappsStaking.currentEra<EraIndex>()).toNumber();
  const contractAddress = getAddressEnum(contract);
  // iterate from currentEra backwards until you find record for ContractEraStake
  for (let era = currentEra; era > 0; era -= 1) {
    const stakeInfoPromise = await api.query.dappsStaking.contractEraStake<
      Option<EraStakingPoints>
    >(contractAddress, era);
    const stakeInfo = await stakeInfoPromise.unwrapOr(undefined);

    if (stakeInfo) {
      return stakeInfo;
    }
  }

  return undefined;
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

  async stake({ commit, dispatch }, parameters: StakingParameters): Promise<boolean> {
    try {
      if (parameters.api) {
        const injector = await getInjector(parameters.substrateAccounts);
        const unsub = await parameters.api.tx.dappsStaking
          .bondAndStake(getAddressEnum(parameters.dapp.address), parameters.amount)
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer,
              nonce: -1,
            },
            (result) => {
              if (result.status.isFinalized) {
                if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
                  dispatch(
                    'general/showAlertMsg',
                    {
                      msg: `You staked ${getFormattedBalance(parameters)} on ${
                        parameters.dapp.name
                      }.`,
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

  async unstake({ commit, dispatch }, parameters: StakingParameters): Promise<boolean> {
    try {
      if (parameters.api) {
        const injector = await getInjector(parameters.substrateAccounts);
        const unsub = await parameters.api.tx.dappsStaking
          .unbondUnstakeAndWithdraw(getAddressEnum(parameters.dapp.address), parameters.amount)
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer,
              nonce: -1,
            },
            (result) => {
              if (result.status.isFinalized) {
                if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
                  commit('setUnlockingChunks', -1);
                  dispatch(
                    'general/showAlertMsg',
                    {
                      msg: `You unstaked ${getFormattedBalance(parameters)} from ${
                        parameters.dapp.name
                      }.`,
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

  async unbond({ commit, dispatch }, parameters: StakingParameters): Promise<boolean> {
    try {
      if (parameters.api) {
        const injector = await getInjector(parameters.substrateAccounts);
        const unsub = await parameters.api.tx.dappsStaking
          .unbondAndUnstake(getAddressEnum(parameters.dapp.address), parameters.amount)
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer,
              nonce: -1,
            },
            (result) => {
              if (result.status.isFinalized) {
                if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
                  commit('setUnlockingChunks', -1);
                  dispatch(
                    'general/showAlertMsg',
                    {
                      msg: `You started unstaking of ${getFormattedBalance(parameters)} from ${
                        parameters.dapp.name
                      }.`,
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

  async withdrawUnbonded({ commit, dispatch }, parameters: WithdrawParameters): Promise<boolean> {
    try {
      if (parameters.api) {
        const injector = await getInjector(parameters.substrateAccounts);
        const unsub = await parameters.api.tx.dappsStaking.withdrawUnbonded().signAndSend(
          parameters.senderAddress,
          {
            signer: injector?.signer,
            nonce: -1,
          },
          (result) => {
            if (result.status.isFinalized) {
              if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
                commit('setUnlockingChunks', -1);
                dispatch(
                  'general/showAlertMsg',
                  {
                    msg: 'Sucessfully withdrawed',
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
        //const erasToClaim = await getErasToClaim(parameters.api, parameters.dapp.address);
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

  async getStakeInfo({ dispatch }, parameters: StakingParameters): Promise<StakeInfo | undefined> {
    try {
      if (parameters.api) {
        const stakeInfo = await getLatestStakePoint(parameters.api, parameters.dapp.address);
        if (stakeInfo) {
          let yourStake = {
            formatted: '',
            denomAmount: new BN('0'),
          };

          if (parameters.isEnableIndividualClaim) {
            const stakerInfo =
              await parameters.api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(
                parameters.senderAddress,
                {
                  Evm: parameters.dapp.address,
                }
              );

            const balance =
              stakerInfo.stakes.length && stakerInfo.stakes.slice(-1)[0].staked.toString();
            if (balance) {
              yourStake = {
                formatted: balanceFormatter(balance),
                denomAmount: new BN(balance.toString()),
              };
            }

            const hasStake = Number(balance.toString()) > 0;
            return {
              totalStake: balanceFormatter(stakeInfo.total.toString()),
              yourStake,
              claimedRewards: '0', // always returns 0 in the below `getClaimInfo` function. (stakeInfo.claimedRewards)
              hasStake,
              stakersCount: Number(stakeInfo.numberOfStakers.toString()),
            } as StakeInfo;
          }

          for (const [account, balance] of stakeInfo.stakers) {
            if (account.toString() === parameters.senderAddress) {
              yourStake = {
                formatted: balanceFormatter(balance),
                denomAmount: new BN(balance.toString()),
              };
              break;
            }
          }

          const hasStake = Number(yourStake.denomAmount.toString()) > 0;
          return {
            totalStake: balanceFormatter(stakeInfo.total),
            yourStake,
            claimedRewards: balanceFormatter(stakeInfo.claimedRewards),
            hasStake,
            stakersCount: stakeInfo.stakers.size,
          } as StakeInfo;
        }
      } else {
        showError(dispatch, 'Api is undefined.');
      }
    } catch (e) {
      // TODO check. There will me many calls to this method. Maybe is better not to show any popup in case of an error.
      console.log(e);
    }
  },

  async getClaimInfo({ dispatch, commit }, parameters: StakingParameters): Promise<ClaimInfo> {
    let accumulatedReward = new BN(0);
    let result: ClaimInfo = {} as ClaimInfo;
    result.rewards = parameters.api.createType('Balance', accumulatedReward);
    result.estimatedClaimedRewards = parameters.api.createType('Balance', 0);
    commit('general/setLoading', true, { root: true });

    try {
      const isEnableIndividualClaim = parameters.isEnableIndividualClaim;
      if (isEnableIndividualClaim) {
        result = await getIndividualClaimStakingInfo(
          parameters.senderAddress,
          parameters.dapp.address
        );
      } else {
        const currentEraIndex = await parameters.api.query.dappsStaking.currentEra<EraIndex>();
        const currentEra = Number(currentEraIndex.toString());
        // Memo: historyDepth is not existing in the upgraded pallet
        const historyDepth = Number(parameters.api.consts.dappsStaking.historyDepth.toString());
        const eraStakesMap = await getClaimableEraStakes(
          parameters.api,
          parameters.dapp.address,
          currentEra,
          historyDepth
        );
        const lowestClaimableEra = getLowestClaimableEra(parameters.api, currentEra, eraStakesMap);
        const bonusEraDuration = Number(
          await parameters.api.consts.dappsStaking.bonusEraDuration.toString()
        );
        // console.log('lowest', lowestClaimableEra);

        // Find a latest stake
        let currentEraStakes: EraStakingPoints | null = null;
        for (let era = currentEra - 1; era >= 1; era--) {
          const eraStakes = eraStakesMap.get(era);

          if (eraStakes?.isSome) {
            currentEraStakes = eraStakes.unwrap();
            break;
          }
        }

        // Get rewards and stakes for all eras.
        const eraRewardsAndStakeMap = new Map();
        const entries =
          await parameters.api.query.dappsStaking.eraRewardsAndStakes.entries<EraRewardAndStake>();
        entries.forEach(([key, stake]) => {
          eraRewardsAndStakeMap.set(Number(key.args.map((k) => k.toString())[0]), stake);
        });

        // calculate reward
        result.unclaimedEras = await getErasToClaim(parameters.api, parameters.dapp.address);
        for (let era of result.unclaimedEras) {
          const eraStakes: EraStakingPoints | undefined = eraStakesMap
            .get(era)
            ?.unwrapOr(undefined);
          if (eraStakes) {
            currentEraStakes = eraStakes;

            // Reward for the era is already claimed.
            if (!eraStakes.claimedRewards.eq(new BN(0))) {
              continue;
            }

            if (currentEraStakes) {
              // TODO check why eraStakes.stakers.get is not working
              for (const [account, balance] of currentEraStakes.stakers) {
                if (account.toString() === parameters.senderAddress) {
                  let eraRewardsAndStakes: EraRewardAndStake = eraRewardsAndStakeMap
                    .get(era)
                    .unwrap();
                  if (eraRewardsAndStakes) {
                    // temp to avoid staked = 0 in first blocks on test env
                    if (eraRewardsAndStakes.staked.eq(new BN(0))) {
                      break;
                    }

                    let eraReward = balance
                      .mul(eraRewardsAndStakes.rewards)
                      .divn(5) // 20% reward percentage
                      .div(eraRewardsAndStakes.staked);

                    accumulatedReward = accumulatedReward.add(eraReward);
                  } else {
                    console.warn('No EraRewardAndStake for era ', era);
                  }

                  break;
                }
              }
            } else {
              console.warn('No stakes found');
            }
          }

          // Commented out becasue the calculation is not feasible in reasonable time
          // on Shibuya, and soon the same will happen on Shiden (as number of era increases).

          // result.estimatedClaimedRewards = getEstimatedClaimedAwards(
          //   currentEra,
          //   eraStakesMap,
          //   eraRewardsAndStakeMap,
          //   parameters.api,
          //   parameters.senderAddress,
          //   bonusEraDuration
          // );
          result.rewards = parameters.api.createType('Balance', accumulatedReward);
        }
      }
    } catch (err) {
      const error = err as unknown as Error;
      console.error(error);
      showError(dispatch, error.message);
    }

    commit('general/setLoading', false, { root: true });
    return result;
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
      }
    } catch (e) {
      const error = e as unknown as Error;
      showError(dispatch, error.message);
    }
  },
};

const getEstimatedClaimedAwards = (
  currentEra: number,
  eraStakesMap: Map<number, Option<EraStakingPoints>>,
  eraRewardAndStake: Map<number, Option<EraRewardAndStake>>,
  api: ApiPromise,
  senderAddress: string,
  bonusEraDuration: number
): Balance => {
  const firstStakedEra = Math.min(...eraStakesMap.keys());
  let claimedSoFar = new BN(0);

  if (firstStakedEra) {
    for (let era = firstStakedEra; era < currentEra; era++) {
      const stakingInfo = eraStakesMap.get(era)?.unwrap();

      if (stakingInfo) {
        for (const [account, balance] of stakingInfo.stakers) {
          if (
            !stakingInfo ||
            stakingInfo.claimedRewards.eq(new BN(0)) ||
            account.toString() !== senderAddress
          ) {
            continue;
          }

          const eraRewardsAndStakes = eraRewardAndStake.get(era)?.unwrap();

          if (eraRewardsAndStakes) {
            let claimedForEra = balance
              .mul(eraRewardsAndStakes.rewards)
              .divn(5) // 20% reward percentage
              .div(eraRewardsAndStakes.staked);

            if (era < bonusEraDuration) {
              claimedForEra = claimedForEra.muln(2);
            }

            claimedSoFar = claimedSoFar.add(claimedForEra);
          }
          break;
        }
      }
    }
  }

  const result = api.createType('Balance', claimedSoFar);
  // console.log('claimed so far', result.toHuman());
  return result;
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
  isEnableIndividualClaim?: boolean;
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

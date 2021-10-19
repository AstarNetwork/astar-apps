import { ActionTree, Dispatch } from 'vuex';
import { web3FromSource } from '@polkadot/extension-dapp';
import { Option, Struct, BTreeMap } from '@polkadot/types';
import {
  EraIndex,
  AccountId,
  Balance,
  EventRecord,
  DispatchError,
} from '@polkadot/types/interfaces';
import { formatBalance } from '@polkadot/util';
import BN from 'bn.js';
import { reduceBalanceToDenom } from 'src/hooks/helper/plasmUtils';
import { StateInterface } from '../index';
import { DappItem, DappStateInterface as State, NewDappItem } from './state';
import { uploadFile, addDapp, getDapps } from 'src/hooks/firebase';
import { ApiPromise } from '@polkadot/api';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { ITuple } from '@polkadot/types/types';

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
const getAddressEnum = (address: string) => ({ Evm: address });

const getFormattedBalance = (parameters: StakingParameters): string => {
  return formatBalance(parameters.amount, {
    withSi: true,
    decimals: parameters.decimals,
    withUnit: parameters.unit,
  });
};

const getCollectionKey = (rootState: StateInterface) => {
  const currentNetworkIdx = rootState.general.currentNetworkIdx;
  const currentNetworkAlias = providerEndpoints[currentNetworkIdx].networkAlias;

  return `${currentNetworkAlias}-dapps`;
};

const hasExtrinsicFailedEvent = (events: EventRecord[], dispatch: Dispatch): boolean => {
  let result = false;

  events
    .filter((record): boolean => !!record.event && record.event.section !== 'democracy')
    .map(({ event: { data, method, section } }) => {
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
          }
        } else if (dispatchError.isToken) {
          message = `${dispatchError.type}.${dispatchError.asToken.type}`;
        }

        showError(dispatch, message);
        result = true;
        //   action: `${section}.${method}`,
      }
    });

  return result;
};

const actions: ActionTree<State, StateInterface> = {
  async getDapps({ commit, dispatch, rootState }) {
    commit('general/setLoading', true, { root: true });

    try {
      const collectionKey = getCollectionKey(rootState);
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
        const injector = await web3FromSource('polkadot-js');
        const unsub = await parameters.api.tx.dappsStaking
          .register(getAddressEnum(parameters.dapp.address))
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer,
            },
            async (result) => {
              if (result.status.isFinalized) {
                if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
                  if (parameters.dapp.iconFileName) {
                    const fileName = `${parameters.dapp.address}_${parameters.dapp.iconFileName}`;
                    parameters.dapp.iconUrl = await uploadFile(fileName, parameters.dapp.iconFile);
                  } else {
                    parameters.dapp.iconUrl = '/images/noimage.png';
                  }

                  if (!parameters.dapp.url) {
                    parameters.dapp.url = '';
                  }

                  const collectionKey = getCollectionKey(rootState);
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
        const injector = await web3FromSource('polkadot-js');
        const unsub = await parameters.api.tx.dappsStaking
          .bondAndStake(getAddressEnum(parameters.dapp.address), parameters.amount)
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer,
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
        const injector = await web3FromSource('polkadot-js');
        const unsub = await parameters.api.tx.dappsStaking
          .unbondUnstakeAndWithdraw(getAddressEnum(parameters.dapp.address), parameters.amount)
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer,
            },
            (result) => {
              if (result.status.isFinalized) {
                if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
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
    } finally {
    }

    return false;
  },

  async claim({ commit, dispatch }, parameters: StakingParameters): Promise<boolean> {
    try {
      if (parameters.api) {
        const injector = await web3FromSource('polkadot-js');
        const unsub = await parameters.api.tx.dappsStaking
          .claim(getAddressEnum(parameters.dapp.address))
          .signAndSend(
            parameters.senderAddress,
            {
              signer: injector?.signer,
            },
            (result) => {
              if (result.isFinalized) {
                if (!hasExtrinsicFailedEvent(result.events, dispatch)) {
                  dispatch(
                    'general/showAlertMsg',
                    {
                      msg: `You claimed from reward ${parameters.dapp.name}.`,
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
        const contractAddress = getAddressEnum(parameters.dapp.address);
        const eraIndexPromise = await parameters.api.query.dappsStaking.contractLastStaked<
          Option<EraIndex>
        >(contractAddress);
        const eraIndex = await eraIndexPromise.unwrapOr(null);

        if (eraIndex) {
          const stakeInfoPromise = await parameters.api.query.dappsStaking.contractEraStake<
            Option<EraStakingPoints>
          >(contractAddress, eraIndex);
          const stakeInfo = await stakeInfoPromise.unwrapOr(null);

          const rewardsClaimed = await parameters.api.query.dappsStaking.rewardsClaimed<Balance>(
            contractAddress,
            parameters.senderAddress
          );

          if (stakeInfo) {
            let yourStake = '';
            for (const [account, balance] of stakeInfo.stakers) {
              if (account.toString() === parameters.senderAddress) {
                yourStake = balance.toHuman();
                break;
              }
            }

            return {
              totalStake: stakeInfo.total.toHuman(),
              yourStake,
              claimedRewards: stakeInfo.claimedRewards.toHuman(),
              userClaimedRewards: rewardsClaimed.toHuman(),
              hasStake: !!yourStake,
            } as StakeInfo;
          }
        }
      } else {
        showError(dispatch, 'Api is undefined.');
      }
    } catch (e) {
      // TODO check. There will me many calls to this method. Maybe is better not to show any popup in case of an error.
      console.log(e);
    }
  },

  async getClaimInfo({ dispatch, commit }, parameters: StakingParameters): Promise<Balance> {
    let accumulatedReward = new BN(0);
    let result: Balance;
    commit('general/setLoading', true, { root: true });

    try {
      const currentEraIndex = await parameters.api.query.dappsStaking.currentEra<EraIndex>();
      const currentEra = parseInt(currentEraIndex.toString());

      const contractAddress = getAddressEnum(parameters.dapp.address);
      const eraLastStakedIndex =
        await parameters.api.query.dappsStaking.contractLastStaked<EraIndex>(contractAddress);
      const eraLastStaked = parseInt(eraLastStakedIndex.toString());

      // Get all staking points for contract.
      const eraStakesMap = new Map();
      const eraStakes =
        await parameters.api.query.dappsStaking.contractEraStake.entries<EraStakingPoints>(
          contractAddress
        );
      eraStakes.forEach(([key, stake]) => {
        eraStakesMap.set(parseInt(key.args.map((k) => k.toString())[1]), stake);
      });

      // Find a first stake
      let currentEraStakes: EraStakingPoints | null = null;
      let firstEraWithStake: number = 1;
      for (let era = eraLastStaked; era < currentEra; era++) {
        const eraStakes = eraStakesMap.get(era);

        if (eraStakes) {
          currentEraStakes = eraStakes.unwrap();
          firstEraWithStake = era;
          break;
        }
      }

      // Get rewards and stakes for all eras.
      const eraRewardsAndStakeMap = new Map();
      const entries =
        await parameters.api.query.dappsStaking.eraRewardsAndStakes.entries<EraRewardAndStake>();
      entries.forEach(([key, stake]) => {
        eraRewardsAndStakeMap.set(parseInt(key.args.map((k) => k.toString())[0]), stake);
      });

      // calculate reward
      for (let era = 1; era < currentEra; era++) {
        if (era > firstEraWithStake) {
          const eraStakes = eraStakesMap.get(era);
          if (eraStakes) {
            currentEraStakes = eraStakes.unwrap();
          }
        }

        if (currentEraStakes) {
          // TODO check why eraStakes.stakers.get is not working
          for (const [account, balance] of currentEraStakes.stakers) {
            if (account.toString() === parameters.senderAddress) {
              let eraRewardsAndStakes = eraRewardsAndStakeMap.get(era).unwrap();
              if (eraRewardsAndStakes) {
                // temp to avoid staked = 0 in first blocks on test env
                if (eraRewardsAndStakes.staked.toString() === '0') {
                  break;
                }

                console.log(
                  'era reward',
                  era,
                  eraRewardsAndStakes.rewards.toHuman(),
                  eraRewardsAndStakes.staked.toHuman()
                );

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
    } catch (err) {
      const error = err as unknown as Error;
      console.error(error);
      showError(dispatch, error.message);
    }

    commit('general/setLoading', false, { root: true });

    result = parameters.api.createType('Balance', accumulatedReward);
    console.log('calculated reward', result.toHuman());
    return result;
  },
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
  decimals: number;
  unit: string;
  finalizeCallback: () => void;
}

export interface StakeInfo {
  yourStake: string | undefined;
  totalStake: string;
  claimedRewards: string;
  userClaimedRewards: string;
  hasStake: boolean;
}

// TODO check why this type is not autogenerated.
// Maybe need to do the following https://polkadot.js.org/docs/api/examples/promise/typegen/
export interface EraStakingPoints extends Struct {
  readonly total: Balance;
  readonly stakers: BTreeMap<AccountId, Balance>;
  readonly formerStakedEra: EraIndex;
  readonly claimedRewards: Balance;
}

export interface EraRewardAndStake extends Struct {
  readonly rewards: Balance;
  readonly staked: Balance;
}

export default actions;

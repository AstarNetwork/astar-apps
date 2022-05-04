import { ref, computed, Ref } from 'vue';
import { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { Balance } from '@polkadot/types/interfaces';
import { Struct, u32, Vec } from '@polkadot/types';
import { getInjector } from 'src/hooks/helper/wallet';
import { hasExtrinsicFailedEvent } from 'src/store/dapp-staking/actions';
import { useCustomSignature } from 'src/hooks';

type EraIndex = u32;

export enum RewardDestination {
  FreeBalance = 'FreeBalance',
  StakeBalance = 'StakeBalance',
}

interface UnlockingChunk extends Struct {
  amount: Balance;
  unlockEra: EraIndex;
}

interface UnbondingInfo extends Struct {
  unlockingChunks: Vec<UnlockingChunk>;
}

interface AccountLedger extends Struct {
  locked: Balance;
  unbondingInfo: UnbondingInfo;
  rewardDestination: RewardDestination;
}

export function useCompoundRewards() {
  const store = useStore();
  const { callFunc, dispatchError, isCustomSig } = useCustomSignature({});
  const currentAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

  const isSupported = ref<boolean>(false);
  const isCompounding = ref<boolean>(false);
  const isStaker = ref<boolean>(false);
  const rewardDestination = ref<RewardDestination>(RewardDestination.FreeBalance);

  const getCompoundingType = async () => {
    try {
      // Check if metadata contains set_reward_destination so we know
      // if compounding is supported by a node or not.
      const metadata = $api?.runtimeMetadata;
      const metadataJson = JSON.stringify(metadata?.toJSON());
      isSupported.value = metadataJson.includes('set_reward_destination');

      // Subscribe to compounding data.
      await $api?.query.dappsStaking.ledger(currentAddress.value, (ledger: AccountLedger) => {
        if (ledger && isSupported.value) {
          rewardDestination.value = ledger.rewardDestination;
          isCompounding.value =
            rewardDestination.value?.toString() === RewardDestination.StakeBalance;
        }

        isStaker.value = ledger.locked.toString() !== '0';
      });
    } catch (err) {
      // Compounding rewards are not supported by a node if reading of ledger.rewardDestination fails
      // or in case of error while querying ledger value.
      console.warn(err);
    }
  };

  const setRewardDestinationCustomExtrinsic = async (rewardDestination: RewardDestination) => {
    try {
      const fn: SubmittableExtrinsicFunction<'promise'> | undefined =
        $api?.tx.dappsStaking.setRewardDestination;
      const method: SubmittableExtrinsic<'promise'> | undefined = fn && fn(rewardDestination);
      method && (await callFunc(method));
    } catch (e) {
      dispatchError((e as Error).message);
    }
  };

  const setRewardDestination = async (rewardDestination: RewardDestination): Promise<void> => {
    if (isCustomSig.value) {
      await setRewardDestinationCustomExtrinsic(rewardDestination);
    } else {
      const injector = await getInjector(substrateAccounts.value);

      try {
        await $api?.tx.dappsStaking.setRewardDestination(rewardDestination).signAndSend(
          currentAddress.value,
          {
            signer: injector.signer,
            nonce: -1,
          },
          async (result) => {
            if (result.status.isFinalized) {
              let errorMessage = '';
              if (
                !hasExtrinsicFailedEvent(
                  result.events,
                  store.dispatch,
                  (message: string) => (errorMessage = message)
                )
              ) {
                store.dispatch(
                  'general/showAlertMsg',
                  {
                    msg: 'You successfully set reward destination.',
                    alertType: 'success',
                  },
                  { root: true }
                );
              } else {
                if (errorMessage.includes('TooManyEraStakeValues')) {
                  errorMessage = `${errorMessage} - Disable compounding, claim your rewards and then enable compounding again.`;
                }
              }

              store.commit('general/setLoading', false, { root: true });
            } else {
              store.commit('general/setLoading', true, { root: true });
            }
          }
        );
      } catch (e) {
        const error = e as unknown as Error;
        store.dispatch(
          'general/showAlertMsg',
          {
            msg: error.message,
            alertType: 'error',
          },
          { root: true }
        );
      }
    }
  };

  getCompoundingType();

  return {
    isSupported,
    isCompounding,
    rewardDestination,
    isStaker,
    setRewardDestination,
  };
}

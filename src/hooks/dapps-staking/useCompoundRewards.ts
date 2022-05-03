import { Struct, u32, Vec } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { $api } from 'boot/api';
import { useCustomSignature } from 'src/hooks';
import { signAndSend } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { hasExtrinsicFailedEvent } from 'src/modules/extrinsic';
import { computed, ref } from 'vue';

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
  const { isCustomSig, handleCustomExtrinsic } = useCustomSignature({});
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
      const metadata = $api.value?.runtimeMetadata;
      const metadataJson = JSON.stringify(metadata?.toJSON());
      isSupported.value = metadataJson.includes('set_reward_destination');

      // Subscribe to compounding data.
      await $api.value?.query.dappsStaking.ledger(currentAddress.value, (ledger: AccountLedger) => {
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

  const setRewardDestination = async (rewardDestination: RewardDestination): Promise<void> => {
    try {
      const transaction = $api.value!.tx.dappsStaking.setRewardDestination(rewardDestination);
      const txResHandler = (result: ISubmittableResult) => {
        if (result.status.isFinalized) {
          let errorMessage = '';
          if (
            !hasExtrinsicFailedEvent(
              result.events,
              store.dispatch,
              (message: string) => (errorMessage = message)
            )
          ) {
            store.dispatch('general/showAlertMsg', {
              msg: 'You successfully set reward destination.',
              alertType: 'success',
            });
          } else {
            if (errorMessage.includes('TooManyEraStakeValues')) {
              errorMessage = `${errorMessage} - Disable compounding, claim your rewards and then enable compounding again.`;
            }
          }

          store.commit('general/setLoading', false);
        } else {
          store.commit('general/setLoading', true);
        }
      };

      await signAndSend({
        transaction,
        senderAddress: currentAddress.value,
        substrateAccounts: substrateAccounts.value,
        isCustomSignature: isCustomSig.value,
        txResHandler,
        handleCustomExtrinsic,
        dispatch: store.dispatch,
      });
    } catch (e: any) {
      console.error(e);
      store.dispatch('general/showAlertMsg', {
        msg: e.message,
        alertType: 'error',
      });
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

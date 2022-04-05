import { ref, computed, Ref } from 'vue';
import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { Balance } from '@polkadot/types/interfaces';
import { Struct, u32, Vec } from '@polkadot/types';
import { getInjector } from 'src/hooks/helper/wallet';
import { hasExtrinsicFailedEvent } from 'src/store/dapp-staking/actions';
import { VoidFn } from '@polkadot/api/types';

type EraIndex = u32;

export enum RewardDestination {
  FreeBalance,
  StakeBalance,
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
  const currentAddress = computed(() => store.getters['general/selectedAddress']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const unsub: Ref<VoidFn | undefined> = ref();

  const isSupported = ref<boolean>(false);
  const rewardDestination = ref<RewardDestination>(RewardDestination.FreeBalance);

  const getCompoundingType = async () => {
    try {
      await $api.value?.query.dappsStaking.ledger(currentAddress.value, (ledger: AccountLedger) => {
        isSupported.value = !!ledger;
        if (ledger) {
          rewardDestination.value = ledger.rewardDestination;
        }
      });
    } catch (err) {
      // Compounding rewards are not supported by a node if reading of ledger.rewardDestination fails
      // or in case of error while querying ledger value.
      console.warn(err);
      isSupported.value = false;
    }
  };

  const setRewardDestination = async (rewardDestination: RewardDestination): Promise<void> => {
    const injector = await getInjector(substrateAccounts.value);

    try {
      await $api.value?.tx.dappsStaking.setRewardDestination(rewardDestination).signAndSend(
        currentAddress.value,
        {
          signer: injector.signer,
          nonce: -1,
        },
        async (result) => {
          if (!hasExtrinsicFailedEvent(result.events, store.dispatch)) {
            store.dispatch(
              'general/showAlertMsg',
              {
                msg: 'You successfully set reward destination.',
                alertType: 'success',
              },
              { root: true }
            );
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
  };

  getCompoundingType();

  return {
    isSupported,
    rewardDestination,
    setRewardDestination,
  };
}

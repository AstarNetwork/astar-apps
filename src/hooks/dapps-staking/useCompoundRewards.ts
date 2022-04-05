import { ref, computed } from 'vue';
import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { Balance } from '@polkadot/types/interfaces';
import { Struct, u32, Vec } from '@polkadot/types';
import { getInjector } from 'src/hooks/helper/wallet';
import { hasExtrinsicFailedEvent } from 'src/store/dapp-staking/actions';

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

  const isSupported = ref<boolean>(false);
  const rewardDestination = ref<RewardDestination>(RewardDestination.FreeBalance);

  const getCompoundingType = async () => {
    try {
      const ledger = await $api.value?.query.dappsStaking.ledger<AccountLedger>(
        currentAddress.value
      );

      if (ledger) {
        rewardDestination.value = ledger.rewardDestination;
        isSupported.value = true;
      } else {
        isSupported.value = false;
      }
    } catch (err) {
      // Compounding rewards are not supported if reading of ledger.rewardDestination fails.
      console.warn(err);
      isSupported.value = false;
    }
  };

  const setRewardDestination = async (rewardDestination: RewardDestination): Promise<void> => {
    const injector = await getInjector(substrateAccounts.value);
    console.log(injector);
    await $api.value?.tx.dappsStaking.setRewardDestination(rewardDestination).signAndSend(
      currentAddress.value,
      {
        signer: injector.signer,
        nonce: -1,
      },
      async (result) => {
        console.log(result);
        hasExtrinsicFailedEvent(result.events, store.dispatch);
      }
    );
  };

  getCompoundingType();

  return {
    isSupported,
    rewardDestination,
    setRewardDestination,
  };
}

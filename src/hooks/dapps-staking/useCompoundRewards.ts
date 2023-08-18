import { interfaces } from 'inversify';
import { checkIsDappOwner, getNumberOfUnclaimedEra } from '@astar-network/astar-sdk-core';
import { Struct, Vec, u32 } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import { $api } from 'boot/api';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAccount } from '../useAccount';
import { useCurrentEra } from '../useCurrentEra';

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

export interface AccountLedger extends Struct {
  locked: Balance;
  unbondingInfo: UnbondingInfo;
  rewardDestination: RewardDestination;
}

export function useCompoundRewards() {
  const store = useStore();
  const { t } = useI18n();
  const { currentAccount, senderSs58Account } = useAccount();
  const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
  const { era } = useCurrentEra();

  const isSupported = ref<boolean>(false);
  const isCompounding = ref<boolean>(false);
  const isStaker = ref<boolean>(false);
  const isUnclaimedEra = ref<boolean>(false);
  const isDappOwner = ref<boolean>(false);
  const toggleCounter = ref<number>(0);
  const rewardDestination = ref<RewardDestination>(RewardDestination.FreeBalance);

  const getCompoundingType = async (): Promise<void> => {
    try {
      // Check if metadata contains set_reward_destination so we know
      // if compounding is supported by a node or not.
      const metadata = $api?.runtimeMetadata;
      const metadataJson = JSON.stringify(metadata?.toJSON());
      isSupported.value = metadataJson.includes('set_reward_destination');

      // Subscribe to compounding data.
      await $api?.query.dappsStaking.ledger(senderSs58Account.value, (ledger: AccountLedger) => {
        if (ledger && isSupported.value) {
          rewardDestination.value = ledger.rewardDestination;
          isCompounding.value =
            ledger.rewardDestination.toString() === RewardDestination.StakeBalance;
        }

        isStaker.value = !ledger.locked.eq(new BN(0));
      });
    } catch (err) {
      // Compounding rewards are not supported by a node if reading of ledger.rewardDestination fails
      // or in case of error while querying ledger value.
      console.warn(err);
    }
  };

  const setRewardDestination = async (rewardDestination: RewardDestination): Promise<void> => {
    try {
      const dappStakingServiceFactory = container.get<() => IDappStakingService>(
        Symbols.DappStakingServiceFactory
      );
      const dappStakingService = dappStakingServiceFactory();
      await dappStakingService.setRewardDestination({
        senderAddress: currentAccount.value,
        rewardDestination,
        successMessage: t('dappStaking.toast.successfullySetRewardDest'),
      });
      toggleCounter.value++;
    } catch (e: any) {
      console.error(e);
      store.dispatch('general/showAlertMsg', {
        msg: e.message,
        alertType: 'error',
      });
    }
  };

  const checkIsClaimable = async (): Promise<void> => {
    if (!dapps.value || !senderSs58Account.value || !era.value) return;
    await Promise.all(
      dapps.value.map(async (it) => {
        const [resIsDappOwner, { numberOfUnclaimedEra, isRequiredWithdraw }] = await Promise.all([
          checkIsDappOwner({
            dappAddress: it.contract.address,
            api: $api!,
            senderAddress: senderSs58Account.value,
          }),
          getNumberOfUnclaimedEra({
            dappAddress: it.contract.address,
            api: $api!,
            senderAddress: senderSs58Account.value,
            currentEra: era.value,
          }),
        ]);

        if (resIsDappOwner) {
          isDappOwner.value = true;
        }

        if (numberOfUnclaimedEra > 0 || isRequiredWithdraw) {
          isUnclaimedEra.value = true;
        }
      })
    );
  };

  watch(
    [senderSs58Account, toggleCounter],
    async () => {
      if (!senderSs58Account.value) return;
      await Promise.all([checkIsClaimable(), getCompoundingType()]);
    },
    { immediate: true }
  );

  return {
    isCompounding,
    isStaker,
    isDappOwner,
    isUnclaimedEra,
    setRewardDestination,
  };
}

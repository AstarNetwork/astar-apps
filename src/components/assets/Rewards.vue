<template>
  <div>
    <div class="rewards__container">
      <div class="rewards__animation" />
      <div class="rewards__inner">
        <div>
          <span class="tw-block tw-font-semibold tw-text-xl tw-leading-none">Your </span>
          <span class="tw-block tw-font-extrabold tw-text-4xl">Reward</span>
        </div>

        <template v-if="isDappDeveloper">
          <!-- <div v-if="isLoading" class="loading">
          <q-skeleton type="rect" animation="fade" />
        </div>
        <div v-else class="value">
          {{ amountOfEras }} {{ $t('myReward.era') }}{{ amountOfEras > 1 ? 's' : '' }}
        </div> -->
          <div>
            <astar-button
              :width="80"
              :height="24"
              :disabled="!canClaim || !canClaimWithoutError"
              @click="claimAll"
            >
              {{ $t('myReward.claim') }}
            </astar-button>
          </div>
        </template>
        <template v-else>
          <div v-if="isLoadingPendingRewards" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="tw-space-x-2">
            <span class="tw-font-extrabold tw-text-4xl">{{ $n(pendingRewards) }}</span>
            <span class="tw-font-semibold tw-text-xl">{{ nativeTokenSymbol }}</span>
          </div>
          <div>
            <astar-button
              :width="80"
              :height="24"
              :disabled="!canClaim || !canClaimWithoutError"
              @click="claimAll"
            >
              {{ $t('myReward.claim') }}
            </astar-button>
          </div>
        </template>
      </div>
    </div>

    <div v-if="!canClaimWithoutError" class="claim-warning">
      <q-icon name="warning" size="20px" class="q-mr-sm" />
      <div>{{ $t('dappStaking.cantClaimWihtoutError') }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { estimatePendingRewards } from '@astar-network/astar-sdk-core';
import { $api } from 'src/boot/api';
import { endpointKey } from 'src/config/chainEndpoints';
import { useAccount, useClaimAll, useNetworkInfo, useStakerInfo } from 'src/hooks';
import { useClaimedReward } from 'src/hooks/dapps-staking/useClaimedReward';
import { RewardDestination } from 'src/hooks/dapps-staking/useCompoundRewards';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';

export default defineComponent({
  setup() {
    const { nativeTokenSymbol, currentNetworkIdx } = useNetworkInfo();
    const { claimAll, canClaim, amountOfEras, isLoading, canClaimWithoutError, isDappDeveloper } =
      useClaimAll();
    const { totalStaked, isLoadingTotalStaked } = useStakerInfo();
    const store = useStore();

    const pendingRewards = ref<number>(0);
    const isLoadingPendingRewards = ref<boolean>(false);

    const changeDestinationForRestaking = async () => {
      const newDestination = isCompounding.value
        ? RewardDestination.FreeBalance
        : RewardDestination.StakeBalance;
      await setRewardDestination(newDestination);
    };

    const { claimed, isLoadingClaimed, isCompounding, setRewardDestination } = useClaimedReward();
    const { currentAccount, senderSs58Account } = useAccount();

    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);
    const goToSubscan = () => {
      let rootName = 'astar';
      if (isShiden.value) {
        rootName = 'shiden';
      }
      const link = `https://${rootName}.subscan.io/account/${currentAccount.value}?tab=reward`;
      window.open(link, '_blank');
    };

    const setPendingRewards = async (): Promise<void> => {
      if (!currentAccount.value || !amountOfEras.value) {
        pendingRewards.value = 0;
        return;
      }
      isLoadingPendingRewards.value = true;
      const { stakerPendingRewards } = await estimatePendingRewards({
        api: $api!,
        walletAddress: senderSs58Account.value,
      });
      pendingRewards.value = stakerPendingRewards;
      isLoadingPendingRewards.value = false;
    };

    watch([senderSs58Account, amountOfEras], setPendingRewards, { immediate: false });

    return {
      isLoading,
      amountOfEras,
      canClaim,
      canClaimWithoutError,
      claimAll,
      isCompounding,
      changeDestinationForRestaking,
      isLoadingClaimed,
      claimed,
      totalStaked,
      nativeTokenSymbol,
      isLoadingTotalStaked,
      goToSubscan,
      pendingRewards,
      isLoadingPendingRewards,
      isDappDeveloper,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/rewards.scss';
</style>

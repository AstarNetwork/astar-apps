<template>
  <div>
    <div class="container--rewards">
      <div class="container--rewards__inner">
        <div>
          <div class="text--label">{{ $t('assets.yourStaking') }}</div>
          <div class="text--title">{{ $t('assets.reward') }}</div>
        </div>

        <template v-if="isDappDeveloper">
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
          <div v-else class="row--reward">
            <span class="row--reward__amount">{{ $n(pendingRewards) }}</span>
            <span class="row--reward__symbol">{{ nativeTokenSymbol }}</span>
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

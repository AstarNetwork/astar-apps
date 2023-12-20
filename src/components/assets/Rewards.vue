<template>
  <button v-if="!isDappDeveloper" class="wrapper--rewards" @click="handleClaim">
    <div class="container--rewards">
      <div class="text--title">
        {{ $t('assets.yourEstimatedRewards') }}
      </div>
      <div class="row--data">
        <div class="value">
          <div>
            <span class="text--amount">{{ $n(pendingRewards || 0) }}</span>
            <span class="text--symbol">{{ nativeTokenSymbol }}</span>
          </div>
        </div>
      </div>
    </div>
  </button>
</template>

<script lang="ts">
import { estimatePendingRewards } from '@astar-network/astar-sdk-core';
import { $api } from 'src/boot/api';
import { endpointKey } from 'src/config/chainEndpoints';
import { useAccount, useClaimAll, useNetworkInfo, useStakerInfo } from 'src/hooks';
import { useClaimedReward } from 'src/hooks/dapps-staking/useClaimedReward';
import { RewardDestination } from 'src/hooks/dapps-staking/useCompoundRewards';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Path as RoutePath } from 'src/router/routes';

export default defineComponent({
  setup() {
    const { nativeTokenSymbol, currentNetworkIdx } = useNetworkInfo();
    const { claimAll, canClaim, amountOfEras, isLoading, canClaimWithoutError, isDappDeveloper } =
      useClaimAll();
    const { totalStaked, isLoadingTotalStaked } = useStakerInfo();
    const router = useRouter();

    const pendingRewards = ref<number>(0);
    const isLoadingPendingRewards = ref<boolean>(true);

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
        isLoadingPendingRewards.value = false;
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

    const handleClaim = async (): Promise<void> => {
      if (isLoadingPendingRewards.value || isLoading.value) return;

      if (pendingRewards.value > 0 && canClaimWithoutError.value) {
        await claimAll();
        await setPendingRewards();
        return;
      }

      if (!Number(totalStaked.value)) {
        router.push({
          path: RoutePath.DappStaking,
        });
        return;
      }
    };

    watch([senderSs58Account, amountOfEras], setPendingRewards, {
      immediate: true,
    });

    return {
      isLoading,
      amountOfEras,
      canClaim,
      canClaimWithoutError,
      isCompounding,
      isLoadingClaimed,
      claimed,
      totalStaked,
      nativeTokenSymbol,
      isLoadingTotalStaked,
      pendingRewards,
      isLoadingPendingRewards,
      isDappDeveloper,
      changeDestinationForRestaking,
      handleClaim,
      goToSubscan,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/rewards.scss';
</style>

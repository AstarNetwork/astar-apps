import { useAccount, useNetworkInfo } from 'src/hooks';
import { useCompoundRewards } from 'src/hooks/dapps-staking/useCompoundRewards';
import { useStore } from 'src/store';
import { computed, ref, watchEffect, watch } from 'vue';
import { wait, getClaimedAmount } from '@astar-network/astar-sdk-core';

export function useClaimedReward() {
  const store = useStore();
  const { isStaker, isDappOwner, isUnclaimedEra, isCompounding, setRewardDestination } =
    useCompoundRewards();
  const { senderSs58Account } = useAccount();
  const pastClaimed = ref<number>(0);
  const isLoadingClaimed = ref<boolean>(false);

  const claimed = computed<number>(() => {
    // Memo: update the number of claimed rewards after users invoking claim action
    const claimedAmount = store.getters['dapps/getClaimedRewards'];
    return claimedAmount + pastClaimed.value;
  });

  const { currentNetworkName } = useNetworkInfo();

  const isEnable = computed<boolean>(() => {
    return isDappOwner.value || isStaker.value || isUnclaimedEra.value;
  });

  const setClaimedAmount = async () => {
    const isLocalNode = currentNetworkName.value === 'Development';
    const isFetch = currentNetworkName.value && senderSs58Account.value && !isLocalNode;
    try {
      if (isFetch) {
        const result = await getClaimedAmount({
          network: currentNetworkName.value.toLowerCase(),
          account: senderSs58Account.value,
        });
        const animationDelay = 2000;
        await wait(animationDelay);
        pastClaimed.value = result;
        isLoadingClaimed.value = false;
      }
    } catch (error) {
      console.error(error);
      isLoadingClaimed.value = false;
    }
  };

  watchEffect(async () => {
    await setClaimedAmount();
  });

  // Memo: Reset the state whenever users access staking page
  // (to avoid the 'double sum bug' after claiming)
  watch(
    [currentNetworkName],
    () => {
      store.commit('dapps/setClaimedRewardsAmount', 0);
    },
    { immediate: true }
  );

  return {
    isEnable,
    claimed,
    isLoadingClaimed,
    isCompounding,
    setRewardDestination,
  };
}

import { $api } from 'boot/api';
import { useAccount } from 'src/hooks';
import { getPendingRewards } from 'src/modules/dapp-staking';
import { Ref, ref, watch } from 'vue';

export const usePendingRewards = (unclaimedEra: Ref<number>) => {
  const { currentAccount } = useAccount();
  const pendingRewards = ref<number>(0);
  const isLoadingPendingRewards = ref<boolean>(false);

  watch(
    [currentAccount, unclaimedEra],
    async () => {
      if (!currentAccount.value || !unclaimedEra.value) {
        pendingRewards.value = 0;
        return;
      }
      isLoadingPendingRewards.value = true;
      const { stakerPendingRewards } = await getPendingRewards({
        api: $api!,
        currentAccount: currentAccount.value,
      });
      pendingRewards.value = stakerPendingRewards;
      isLoadingPendingRewards.value = false;
      // Todo: remove
      console.log('stakerPendingRewards', stakerPendingRewards);
    },
    { immediate: false }
  );

  return { pendingRewards, isLoadingPendingRewards };
};

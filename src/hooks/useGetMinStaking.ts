import { VoidFn } from '@polkadot/api/types';
import { $api } from 'boot/api';
import { onUnmounted, ref, Ref, watchEffect } from 'vue';

export function useGetMinStaking() {
  const minStaking = ref<string>('0');
  const unsub: Ref<VoidFn | undefined> = ref();

  watchEffect(() => {
    if (unsub.value) {
      unsub.value();
      unsub.value = undefined;
    }

    $api!.isReady.then(async () => {
      const amount = await $api!.consts.dappsStaking.minimumStakingAmount;
      minStaking.value = amount.toString();
    });
  });

  onUnmounted(() => {
    const unsubFn = unsub.value;
    if (unsubFn) {
      unsubFn();
    }
  });
  return {
    minStaking,
  };
}

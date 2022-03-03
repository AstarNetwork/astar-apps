import { VoidFn } from '@polkadot/api/types';
import BN from 'bn.js';
import { onUnmounted, ref, Ref, watchEffect } from 'vue';
import { $api } from 'boot/api';

export function useGetMinStaking() {
  const minStaking = ref<BN>(new BN(0));
  const unsub: Ref<VoidFn | undefined> = ref();

  watchEffect(() => {
    if (unsub.value) {
      unsub.value();
      unsub.value = undefined;
    }

    $api.value?.isReady.then(async () => {
      const amount = await $api.value?.consts.dappsStaking.minimumStakingAmount;
      if (amount) {
        minStaking.value = new BN(amount.toString());
      }
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

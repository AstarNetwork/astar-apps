import { VoidFn } from '@polkadot/api/types';
import BN from 'bn.js';
import { onUnmounted, ref, Ref, watchEffect } from 'vue';

export function useGetMinStaking(apiRef: any) {
  const minStaking = ref<BN>(new BN(0));
  const unsub: Ref<VoidFn | undefined> = ref();

  watchEffect(() => {
    const api = apiRef?.value;
    if (!api) return;

    if (unsub.value) {
      unsub.value();
      unsub.value = undefined;
    }

    api.isReady.then(async () => {
      const amount = await api.consts.dappsStaking.minimumStakingAmount;
      minStaking.value = amount;
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

import { ApiPromise } from '@polkadot/api';
import { ref, watchEffect } from 'vue';

export const useUnbondWithdraw = (apiRef: ApiPromise | undefined) => {
  const canUnbondWithdraw = ref<boolean>(false);

  watchEffect(() => {
    try {
      const unbondingPeriod = apiRef?.consts.dappsStaking.unbondingPeriod;
      canUnbondWithdraw.value = !!unbondingPeriod;
    } catch {
      canUnbondWithdraw.value = false;
    }
  });

  return {
    canUnbondWithdraw,
  };
};

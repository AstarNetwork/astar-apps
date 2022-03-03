import { ref, watchEffect } from 'vue';
import { $api } from 'boot/api';

export const useUnbondWithdraw = () => {
  const canUnbondWithdraw = ref<boolean>(false);

  watchEffect(() => {
    try {
      const unbondingPeriod = $api.value?.consts.dappsStaking.unbondingPeriod;
      canUnbondWithdraw.value = !!unbondingPeriod;
    } catch {
      canUnbondWithdraw.value = false;
    }
  });

  return {
    canUnbondWithdraw,
  };
};

import { ref, watchEffect } from 'vue';

export const useUnbondWithdraw = (apiRef: any) => {
  const canUnbondWithdraw = ref<boolean>(false);

  watchEffect(() => {
    try {
      const unbondingPeriod = apiRef.value?.consts.dappsStaking.unbondingPeriod;
      canUnbondWithdraw.value = !!unbondingPeriod;
    } catch {
      canUnbondWithdraw.value = false;
    }
  });

  return {
    canUnbondWithdraw,
  };
};

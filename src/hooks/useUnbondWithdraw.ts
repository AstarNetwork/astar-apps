import { useStore } from 'src/store';
import { computed } from 'vue';
import { endpointKey } from 'src/config/chainEndpoints';

export const useUnbondWithdraw = () => {
  const store = useStore();

  const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

  const canUnbondWithdraw =
    currentNetworkIdx.value === endpointKey.LOCAL ||
    currentNetworkIdx.value === endpointKey.SHIBUYA;

  return {
    canUnbondWithdraw,
  };
};

import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import { getUsdBySymbol, wait } from '@astar-network/astar-sdk-core';

export function usePrice() {
  const store = useStore();
  const nativeTokenUsd = ref<number>(0);
  const tokenSymbol = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.tokenSymbol : '';
  });

  const { isMainnet, isAstarZkEvm } = useNetworkInfo();

  watch(
    [tokenSymbol],
    async () => {
      // Memo: hacky way to fix the 'invalid BigNumber string' error
      await wait(500);
      const tokenSymbolRef = tokenSymbol.value;
      if (!tokenSymbolRef) return;
      try {
        if (isMainnet.value) {
          const nativeToken = isAstarZkEvm.value ? 'ETH' : tokenSymbolRef;
          nativeTokenUsd.value = await getUsdBySymbol(nativeToken);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    },
    { immediate: true }
  );

  return {
    nativeTokenUsd,
  };
}

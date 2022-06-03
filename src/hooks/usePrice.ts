import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { getUsdPrice } from './helper/price';

export function usePrice() {
  const store = useStore();
  const nativeTokenUsd = ref<number>(0);
  const tokenSymbol = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.tokenSymbol : '';
  });

  const isMainnet = computed<boolean>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const network = chainInfo ? chainInfo.chain : '';
    const isTestnet = network === 'Development' || network === 'Shibuya Testnet';
    return !isTestnet;
  });

  watchEffect(async () => {
    const tokenSymbolRef = tokenSymbol.value;
    if (!tokenSymbolRef) return;
    try {
      const coingeckoTicker = tokenSymbolRef === 'SDN' ? 'shiden' : 'astar';
      if (isMainnet.value) {
        nativeTokenUsd.value = await getUsdPrice(coingeckoTicker);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  });

  return {
    nativeTokenUsd,
  };
}

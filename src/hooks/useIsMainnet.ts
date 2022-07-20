import { useStore } from 'src/store';
import { computed } from 'vue';

export function useIsMainnet() {
  const store = useStore();

  const isMainnet = computed<boolean>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const network = chainInfo ? chainInfo.chain : '';
    const isTestnet = network === 'Development' || network === 'Shibuya Testnet';
    return !isTestnet;
  });

  return {
    isMainnet,
  };
}

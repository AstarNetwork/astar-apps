import { SupportWallet } from 'src/config/wallets';
import { useStore } from 'src/store';
import { ref, computed, watch, WatchCallback } from 'vue';
import { getEvmProvider } from '../helper/wallet';
import { EthereumProvider } from '../types/CustomSignature';

export function useEthProvider() {
  const ethProvider = ref<EthereumProvider>();
  const store = useStore();
  const currentWallet = computed<SupportWallet>(() => store.getters['general/currentWallet']);

  const setEthProvider: WatchCallback<SupportWallet> = (wallet: SupportWallet) => {
    const provider = getEvmProvider(wallet);
    if (provider) {
      ethProvider.value = provider;
    }
  };

  watch(currentWallet, setEthProvider, { immediate: true });
  return { ethProvider };
}

import { SupportWallet } from 'src/config/wallets';
import { useStore } from 'src/store';
import { ref, watchEffect, computed } from 'vue';
import { EthereumProvider } from '../types/CustomSignature';

export function useEthProvider() {
  const ethProvider = ref<EthereumProvider>();

  const store = useStore();
  const currentWallet = computed(() => store.getters['general/currentWallet']);

  // TODO find a way to se if is talisman or metamask

  watchEffect(() => {
    if (
      typeof window.ethereum !== 'undefined' &&
      window.ethereum &&
      currentWallet.value === SupportWallet.MetaMask
    ) {
      ethProvider.value = window.ethereum;
    }

    if (
      typeof window.talismanEth !== 'undefined' &&
      window.talismanEth &&
      currentWallet.value === SupportWallet.Talisman
    ) {
      ethProvider.value = window.talismanEth;
    }
  });

  return { ethProvider };
}

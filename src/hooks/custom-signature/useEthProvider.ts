import { SupportWallet } from 'src/config/wallets';
import { useStore } from 'src/store';
import { ref, computed, watch, WatchCallback } from 'vue';
import { EthereumProvider } from '../types/CustomSignature';

export function useEthProvider() {
  const ethProvider = ref<EthereumProvider>();

  const store = useStore();
  const currentWallet = computed(() => store.getters['general/currentWallet']);

  const setEthProvider: WatchCallback<SupportWallet> = (wallet) => {
    if (
      typeof window.ethereum !== 'undefined' &&
      window.ethereum &&
      wallet === SupportWallet.MetaMask
    ) {
      ethProvider.value = window.ethereum;
    }

    if (
      typeof window.talismanEth !== 'undefined' &&
      window.talismanEth &&
      wallet === SupportWallet.TalismanEvm
    ) {
      ethProvider.value = window.talismanEth;
    }

    if (
      typeof window.SubWallet !== 'undefined' &&
      window.SubWallet &&
      wallet === SupportWallet.SubWalletEvm
    ) {
      ethProvider.value = window.SubWallet;
    }
  };

  watch(currentWallet, setEthProvider, { immediate: true });

  return { ethProvider };
}

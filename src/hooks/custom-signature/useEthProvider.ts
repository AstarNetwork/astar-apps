import { SupportWallet } from 'src/config/wallets';
import { useStore } from 'src/store';
import { ref, computed, watch, WatchCallback, onUnmounted } from 'vue';
import { getEvmProvider, getWcProvider } from '../helper/wallet';
import { EthereumProvider } from '../types/CustomSignature';
import Web3 from 'web3';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export function useEthProvider() {
  const ethProvider = ref<EthereumProvider>();
  const store = useStore();
  const currentWallet = computed<SupportWallet>(() => store.getters['general/currentWallet']);
  const web3Provider = computed<Web3 | undefined>(() =>
    ethProvider.value ? new Web3(ethProvider.value as any) : undefined
  );

  const setEthProvider = (): void => {
    let provider;
    const wallet = String(localStorage.getItem(LOCAL_STORAGE.SELECTED_WALLET));

    if (wallet === SupportWallet.WalletConnect) {
      provider = getWcProvider();
    } else {
      provider = getEvmProvider(currentWallet.value);
    }

    if (provider) {
      ethProvider.value = provider;
    }
  };

  window.addEventListener(SupportWallet.WalletConnect, setEthProvider);

  onUnmounted(() => {
    window.removeEventListener(SupportWallet.WalletConnect, setEthProvider);
  });

  watch(currentWallet, setEthProvider, { immediate: true });
  return { ethProvider, web3Provider };
}

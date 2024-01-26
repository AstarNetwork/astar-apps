import { SupportWallet } from 'src/config/wallets';
import { useStore } from 'src/store';
import { ref, computed, watch, WatchCallback, onUnmounted } from 'vue';
import { getEvmProvider } from '../helper/wallet';
import { EthereumProvider } from '../types/CustomSignature';
import Web3 from 'web3';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';

export function useEthProvider() {
  const ethProvider = ref<EthereumProvider>();
  const store = useStore();
  const currentWallet = computed<SupportWallet>(() => store.getters['general/currentWallet']);
  const web3Provider = computed<Web3 | undefined>(() =>
    ethProvider.value ? new Web3(ethProvider.value as any) : undefined
  );

  const setEthProvider = (): void => {
    console.log('setEthProvider');
    let wcProvider;
    try {
      wcProvider = container.get<EthereumProvider>(Symbols.WcProvider);
      console.log('wcProvider', wcProvider);
    } catch (error) {}

    const provider = wcProvider ? wcProvider : getEvmProvider(currentWallet.value);
    console.log('setEthProvider', provider);
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

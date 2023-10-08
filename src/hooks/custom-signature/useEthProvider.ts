import { SupportWallet } from 'src/config/wallets';
import { useStore } from 'src/store';
import { ref, computed, watch, WatchCallback } from 'vue';
import { getEvmProvider } from '../helper/wallet';
import { EthereumProvider } from '../types/CustomSignature';
import Web3 from 'web3';

export function useEthProvider() {
  const ethProvider = ref<EthereumProvider>();
  const store = useStore();
  const currentWallet = computed<SupportWallet>(() => store.getters['general/currentWallet']);
  const web3Provider = computed<Web3 | undefined>(() =>
    ethProvider.value ? new Web3(ethProvider.value as any) : undefined
  );

  const setEthProvider: WatchCallback<SupportWallet> = (wallet: SupportWallet) => {
    const provider = getEvmProvider(wallet);
    if (provider) {
      ethProvider.value = provider;
    }
  };

  watch(currentWallet, setEthProvider, { immediate: true });
  return { ethProvider, web3Provider };
}

import { useStore } from 'src/store';
import { computed, ref, watch, WatchCallback } from 'vue';
import Web3 from 'web3';
import { setupNetwork } from 'src/config/web3';
import { useEthProvider } from '../custom-signature/useEthProvider';
import { EthereumProvider } from '../types/CustomSignature';
import { useNetworkInfo } from '../useNetworkInfo';

export const useEvmWallet = () => {
  const walletNetworkId = ref<number | null>(null);
  const store = useStore();
  const { ethProvider } = useEthProvider();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  const { currentNetworkName, evmNetworkIdx } = useNetworkInfo();

  const isConnectedNetwork = computed(() => {
    if (!isH160.value) return false;
    return evmNetworkIdx.value === walletNetworkId.value;
  });

  const connectEvmNetwork = async () => {
    try {
      if (!ethProvider.value) {
        throw new Error('No Ethereum provider found');
      }

      await setupNetwork({ network: evmNetworkIdx.value, provider: ethProvider.value });
    } catch (error) {
      console.error(error);
    }
  };

  const setWalletNetworkId: WatchCallback<[any, EthereumProvider | undefined]> = async (
    [h160, provider],
    _,
    registerCleanup
  ) => {
    try {
      if (!h160 || !provider) return;

      const web3 = new Web3(provider as any);

      const chainId = await web3.eth.getChainId();
      walletNetworkId.value = chainId;

      const handleChainChanged = (chainId: string) => {
        walletNetworkId.value = Number(chainId);
      };

      //subscribe to chainChanged event
      provider.on('chainChanged', handleChainChanged);

      registerCleanup(() => {
        // unsubscribe from chainChanged event to prevent memory leak
        provider.removeListener('chainChanged', handleChainChanged);
      });
    } catch (error) {
      console.error(error);
      walletNetworkId.value = null;
    }
  };

  watch([isH160, ethProvider], setWalletNetworkId, { immediate: true });

  return {
    isConnectedNetwork,
    currentNetworkName,
    connectEvmNetwork,
  };
};

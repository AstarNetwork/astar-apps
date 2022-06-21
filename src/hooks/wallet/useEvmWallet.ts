import { getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';

import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import Web3 from 'web3';
import { setupNetwork } from 'src/config/web3';
import { useEthProvider } from '../custom-signature/useEthProvider';

export const useEvmWallet = () => {
  const walletNetworkId = ref<number | null>(null);
  const store = useStore();
  const { ethProvider } = useEthProvider();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);

  const evmNetworkId = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    const networkId = getProviderIndex(chain);
    return Number(providerEndpoints[networkId].evmChainId);
  });

  const isConnectedNetwork = computed(() => {
    if (!isH160.value) return false;
    return evmNetworkId.value === walletNetworkId.value;
  });

  const currentNetworkName = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return chain === 'Shibuya Testnet' ? 'Shibuya' : chain;
  });

  const connectEvmNetwork = async () => {
    try {
      if (!ethProvider.value) {
        throw new Error('No Ethereum provider found');
      }

      await setupNetwork({ network: evmNetworkId.value, provider: ethProvider.value });
    } catch (error) {
      console.error(error);
    }
  };

  watch(
    [isH160, ethProvider],
    async ([h160, provider], _, registerCleanup) => {
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
          provider.off('chainChanged', handleChainChanged);
        });
      } catch (error) {
        console.error(error);
        walletNetworkId.value = null;
      }
    },
    { immediate: true }
  );

  return {
    isConnectedNetwork,
    currentNetworkName,
    evmNetworkId,
    connectEvmNetwork,
  };
};

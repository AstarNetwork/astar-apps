import { getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import Web3 from 'web3';
import { setupNetwork } from 'src/config/web3';

export const useEvmWallet = () => {
  const walletNetworkId = ref<number | null>(null);
  const store = useStore();
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
      await setupNetwork(evmNetworkId.value);
    } catch (error) {
      console.error(error);
    }
  };

  watchEffect(async () => {
    try {
      const provider = getEvmProvider();
      if (!isH160.value || !provider) return;

      const web3 = new Web3(provider as any);
      const chainId = await web3.eth.getChainId();
      walletNetworkId.value = chainId;

      provider &&
        provider.on('chainChanged', (chainId: string) => {
          walletNetworkId.value = Number(chainId);
        });
    } catch (error) {
      console.error(error);
      walletNetworkId.value = null;
    }
  });

  return {
    isConnectedNetwork,
    currentNetworkName,
    evmNetworkId,
    connectEvmNetwork,
  };
};

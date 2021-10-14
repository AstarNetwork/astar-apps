import { ref, watchEffect } from 'vue';
import { EthereumProvider } from '../types/CustomSignature';

export function useEthProvider() {
  const ethProvider = ref<EthereumProvider>();

  watchEffect(() => {
    if (typeof window.ethereum !== 'undefined' && window.ethereum) {
      ethProvider.value = window.ethereum;
    }
  });

  return { ethProvider };
}

import { ref, watchEffect } from 'vue';
import { EthereumProvider } from '../types/CustomSignature';

export function useEthProvider() {
  const ethProvider = ref<EthereumProvider>();

  // TODO find a way to se if is talisman or metamask

  watchEffect(() => {
    if (typeof window.ethereum !== 'undefined' && window.ethereum) {
      ethProvider.value = window.ethereum;
    }
  });

  return { ethProvider };
}

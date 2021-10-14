import { ref, watch } from 'vue';
import { useEthProvider } from './useEthProvider';

export function useMetamask() {
  const { ethProvider } = useEthProvider();
  const loadedAccounts = ref<string[]>([]);

  const requestAccounts = async () => {
    if (!ethProvider.value) {
      throw new Error('Cannot detect Metamask');
    }

    const accounts = (await ethProvider.value.request({
      method: 'eth_requestAccounts',
    })) as string[];
    loadedAccounts.value = accounts;
    return accounts;
  };

  const requestSignature = async (message: string, account: string = loadedAccounts.value[0]) => {
    if (!account || !ethProvider.value) {
      throw new Error('No account was provided for the signature');
    }

    const sigResponse = await ethProvider.value.request({
      method: 'personal_sign',
      params: [account, message],
    });
    if (!sigResponse || typeof sigResponse !== 'string') {
      throw new Error('Failed to get signature');
    }

    return sigResponse;
  };

  watch(ethProvider, () => {
    if (ethProvider.value?.isMetaMask) {
      const ethereum = ethProvider.value;

      ethereum.on('accountsChanged', (accounts: string[]) => {
        loadedAccounts.value = accounts;
      });

      ethereum.on('chainChanged', () => {
        // refresh the page if the user changes the network
        window.location.reload();
      });
    }
  });

  return { loadedAccounts, requestAccounts, requestSignature };
}

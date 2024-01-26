import { LOCAL_STORAGE } from 'src/config/localStorage';
import { ref, watch, WatchCallback, computed } from 'vue';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { useEthProvider } from 'src/hooks/custom-signature/useEthProvider';
import { useRouter } from 'vue-router';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { SupportWallet } from 'src/config/wallets';

export function useEvmAccount() {
  const { ethProvider } = useEthProvider();
  const loadedAccounts = ref<string[]>([]);
  const router = useRouter();
  const currentRouter = computed(() => router.currentRoute.value.matched[0]);

  const requestAccounts = async () => {
    let provider = ethProvider.value;
    if (!provider) {
      throw new Error('Cannot detect any EVM Account');
    }

    const accounts = (await provider.request({
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

  const setLoadedAccounts: WatchCallback<EthereumProvider | undefined> = (
    provider,
    _,
    registerCleanup
  ) => {
    if (provider) {
      const handleAccountsChanged = (accounts: string[]) => {
        loadedAccounts.value = accounts;
      };
      const handleChainChanged = () => {
        // Memo: Do not reload for the Bridge page
        if (currentRouter.value.name === 'Bridge') return;

        const wallet = String(localStorage.getItem(LOCAL_STORAGE.SELECTED_WALLET));

        // refresh the page if the user changes the network
        wallet !== SupportWallet.WalletConnect && window.location.reload();
      };

      // subscribe to changes
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);

      // unsubscribe / prevent memory leak
      registerCleanup(() => {
        // Memo: this block calls a lot of `watchs` / `watchEffects` (that outside of this file) way too much after hot reloading
        if (!process.env.DEV) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
        }
      });
    }
  };

  watch(ethProvider, setLoadedAccounts, { immediate: true });

  return { loadedAccounts, requestAccounts, requestSignature };
}

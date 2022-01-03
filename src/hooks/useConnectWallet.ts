import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useAccount } from 'src/hooks';
import { useStore } from 'src/store';
import { getChainId, setupNetwork } from 'src/web3';
import { computed, ref, watchEffect } from 'vue';
import { useMetamask } from './custom-signature/useMetamask';

enum WalletOption {
  SelectWallet = 'SelectWallet',
  SelectPolkadotAccount = 'SelectPolkadotAccount',
  NoExtension = 'NoExtension',
  PolkadotJs = 'Polkadot.js',
  MetaMask = 'MetaMask',
}

export const useConnectWallet = () => {
  const modalConnectWallet = ref<boolean>(false);
  const modalAccountSelect = ref<boolean>(false);
  const selectedWallet = ref<string>('');
  const modalName = ref<string>('');

  const { requestAccounts } = useMetamask();
  const store = useStore();
  const { allAccounts, allAccountNames, currentAccount, currentAccountName, disconnectAccount } =
    useAccount();

  const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
  const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

  const setCloseModal = () => {
    modalName.value = '';
  };

  const openSelectModal = () => {
    modalName.value = WalletOption.SelectWallet;
  };

  const setPolkadot = async () => {
    selectedWallet.value = WalletOption.PolkadotJs;
    modalName.value = WalletOption.PolkadotJs;
  };

  const loadMetaMask = async (): Promise<boolean> => {
    try {
      const accounts = await requestAccounts();
      const ethereumAddr = accounts[0];
      store.commit('general/setCurrentEcdsaAccount', {
        ethereum: ethereumAddr,
        h160: ethereumAddr,
      });
      store.commit('general/setIsH160Formatted', true);

      const chainId = getChainId(currentNetworkIdx.value);
      setTimeout(async () => {
        await setupNetwork(chainId);
      }, 500);
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  };

  const setMetaMask = async () => {
    selectedWallet.value = WalletOption.MetaMask;
    const isMetamaskExtension = typeof window.ethereum !== 'undefined';
    if (!isMetamaskExtension) {
      modalName.value = WalletOption.NoExtension;
      return;
    }
    const result = await loadMetaMask();
    if (result) {
      modalName.value = '';
      return;
    }
  };

  watchEffect(() => {
    if (modalName.value === WalletOption.PolkadotJs) {
      if (allAccounts.value.length === 0) {
        modalName.value = WalletOption.NoExtension;
        modalAccountSelect.value = false;
        return;
      }
      modalName.value = WalletOption.SelectPolkadotAccount;
      modalAccountSelect.value = true;
      return;
    }
  });

  const { SELECTED_ACCOUNT_ID } = LOCAL_STORAGE;
  const currentAccountIdx = computed(() => store.getters['general/accountIdx']);

  watchEffect(async () => {
    const accountId = localStorage.getItem(SELECTED_ACCOUNT_ID);

    if (currentAccountIdx.value !== null || accountId === null) return;

    if (accountId === 'Ethereum Extension') {
      await setMetaMask();
      return;
    }

    if (accountId !== null) {
      store.commit('general/setCurrentAccountIdx', Number(accountId));
      return;
    }
  });

  return {
    WalletOption,
    currentNetworkStatus,
    modalConnectWallet,
    currentAccount,
    currentAccountName,
    modalName,
    allAccounts,
    allAccountNames,
    selectedWallet,
    modalAccountSelect,
    openSelectModal,
    setPolkadot,
    setCloseModal,
    setMetaMask,
    disconnectAccount,
  };
};

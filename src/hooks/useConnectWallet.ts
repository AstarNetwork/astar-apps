import { web3Enable } from '@polkadot/extension-dapp';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SupportWallets } from 'src/config/wallets';
import { useAccount } from 'src/hooks';
import { useStore } from 'src/store';
import { getChainId, setupNetwork } from 'src/web3';
import { computed, ref, watchEffect } from 'vue';
import { useMetamask } from './custom-signature/useMetamask';
import { getInjectedExtensions } from './helper/wallet';

enum WalletOption {
  SelectWallet = 'SelectWallet',
  SelectSubstrateAccount = 'SelectSubstrateAccount',
  NoExtension = 'NoExtension',
  PolkadotJs = 'Polkadot.js',
  Clover = 'Clover',
  MetaMask = 'MetaMask',
}

export const useConnectWallet = () => {
  const modalConnectWallet = ref<boolean>(false);
  const modalAccountSelect = ref<boolean>(false);
  const selectedWallet = ref<string>('');
  const modalName = ref<string>('');

  const { requestAccounts } = useMetamask();
  const store = useStore();
  const { currentAccount, currentAccountName, disconnectAccount } = useAccount();

  const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
  const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

  const { SELECTED_ACCOUNT_ID } = LOCAL_STORAGE;

  const setCloseModal = () => {
    modalName.value = '';
  };

  const openSelectModal = () => {
    modalName.value = WalletOption.SelectWallet;
  };

  const setPolkadot = async () => {
    selectedWallet.value = SupportWallets.PolkadotJs;
    modalName.value = WalletOption.PolkadotJs;
  };

  const setClover = async () => {
    selectedWallet.value = SupportWallets.Clover;
    modalName.value = WalletOption.Clover;
  };

  const setWalletModal = (wallet: SupportWallets): void => {
    if (wallet === SupportWallets.PolkadotJs) {
      setPolkadot();
    }
    if (wallet === SupportWallets.Clover) {
      setClover();
    }
    if (wallet === SupportWallets.MetaMask) {
      setMetaMask();
    }
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
    selectedWallet.value = SupportWallets.MetaMask;
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

  watchEffect(async () => {
    if (modalName.value === WalletOption.PolkadotJs || modalName.value === WalletOption.Clover) {
      const injected = await getInjectedExtensions();
      const isInstalledExtension = injected.find((it) => selectedWallet.value === it.name);

      if (!isInstalledExtension) {
        modalName.value = WalletOption.NoExtension;
        modalAccountSelect.value = false;
        return;
      }
      modalName.value = WalletOption.SelectSubstrateAccount;
      modalAccountSelect.value = true;
      return;
    }
  });

  watchEffect(async () => {
    const accountId = localStorage.getItem(SELECTED_ACCOUNT_ID);
    if (accountId === null) return;

    if (accountId === 'Ethereum Extension') {
      await setMetaMask();
      return;
    }

    if (accountId) {
      store.commit('general/setCurrentAccountIdx', accountId);
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
    selectedWallet,
    modalAccountSelect,
    openSelectModal,
    setCloseModal,
    setWalletModal,
    disconnectAccount,
  };
};

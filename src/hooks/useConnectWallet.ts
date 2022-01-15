import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SubstrateWallets, SupportWallet, WalletModalOption } from 'src/config/wallets';
import { useAccount } from 'src/hooks';
import { useStore } from 'src/store';
import { getChainId, setupNetwork } from 'src/web3';
import { computed, ref, watchEffect } from 'vue';
import { useMetamask } from './custom-signature/useMetamask';
import { getInjectedExtensions } from './helper/wallet';

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

  const { SELECTED_ADDRESS } = LOCAL_STORAGE;

  const setCloseModal = () => {
    modalName.value = '';
  };

  const openSelectModal = () => {
    modalName.value = WalletModalOption.SelectWallet;
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
    selectedWallet.value = SupportWallet.MetaMask;
    const isMetamaskExtension = typeof window.ethereum !== 'undefined';
    if (!isMetamaskExtension) {
      modalName.value = WalletModalOption.NoExtension;
      return;
    }
    const result = await loadMetaMask();
    if (result) {
      modalName.value = '';
      return;
    }
  };

  const setWalletModal = (wallet: SupportWallet): void => {
    if (wallet === SupportWallet.MetaMask) {
      setMetaMask();
      return;
    }
    selectedWallet.value = wallet;
    modalName.value = wallet;
  };

  watchEffect(async () => {
    if (SubstrateWallets.find((it) => it === modalName.value)) {
      const injected = await getInjectedExtensions();
      const isInstalledExtension = injected.find((it) => selectedWallet.value === it.name);

      if (!isInstalledExtension) {
        modalName.value = WalletModalOption.NoExtension;
        modalAccountSelect.value = false;
        return;
      }
      modalName.value = WalletModalOption.SelectSubstrateAccount;
      modalAccountSelect.value = true;
      return;
    }
  });

  watchEffect(async () => {
    const address = localStorage.getItem(SELECTED_ADDRESS);
    if (address === null) return;

    if (address === 'Ethereum Extension') {
      await setMetaMask();
      return;
    }

    if (address) {
      store.commit('general/setCurrentAddress', address);
      return;
    }
  });

  return {
    WalletModalOption,
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

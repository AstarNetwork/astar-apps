import { getProviderIndex } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SubstrateWallets, SupportWallet, WalletModalOption } from 'src/config/wallets';
import { getChainId, setupNetwork } from 'src/config/web3';
import { useAccount } from 'src/hooks';
import * as utils from 'src/hooks/custom-signature/utils';
import { deepLinkPath } from 'src/links';
import { useStore } from 'src/store';
import { computed, ref, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useMetamask } from './custom-signature/useMetamask';
import { ASTAR_SS58_FORMAT } from './helper/plasmUtils';
import {
  castMobileSource,
  checkIsWalletExtension,
  getDeepLinkUrl,
  getInjectedExtensions,
  getSelectedAccount,
  isMobileDevice,
} from './helper/wallet';

export const useConnectWallet = () => {
  const { SELECTED_ADDRESS, NETWORK_IDX } = LOCAL_STORAGE;

  const modalConnectWallet = ref<boolean>(false);
  const modalAccountSelect = ref<boolean>(false);
  const selectedWallet = ref<string>('');
  const modalName = ref<string>('');

  const store = useStore();
  const { requestAccounts, requestSignature } = useMetamask();
  const { currentAccount, currentAccountName, disconnectAccount } = useAccount();
  const router = useRouter();

  const currentRouter = computed(() => router.currentRoute.value.matched[0]);
  const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const isEthWallet = computed(() => store.getters['general/isEthWallet']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const isConnectedNetwork = computed(() => store.getters['general/networkStatus'] === 'connected');
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const selectedWalletSource = computed(() => {
    try {
      const accounts = store.getters['general/substrateAccounts'];
      const selectedAccount = getSelectedAccount(accounts);
      return selectedAccount ? selectedAccount.source : null;
    } catch (error) {
      return null;
    }
  });

  const setCloseModal = () => {
    modalName.value = '';
  };

  const openSelectModal = () => {
    modalName.value = WalletModalOption.SelectWallet;
  };

  const initializeWalletAccount = () => {
    const account = localStorage.getItem(SELECTED_ADDRESS);
    if (!account) {
      openSelectModal();
    } else {
      if (selectedWalletSource.value) {
        selectedWallet.value = selectedWalletSource.value;
      }
    }
  };

  const loadMetaMask = async (ss58?: string): Promise<boolean> => {
    try {
      const accounts = await requestAccounts();
      const ethereumAddr = accounts[0];
      const data = ss58
        ? {
            ethereum: ethereumAddr,
            ss58,
          }
        : {
            ethereum: ethereumAddr,
            h160: ethereumAddr,
          };

      store.commit('general/setCurrentEcdsaAccount', data);
      const storedNetworkId = localStorage.getItem(NETWORK_IDX);
      const chainId = getChainId(
        storedNetworkId ? Number(storedNetworkId) : currentNetworkIdx.value
      );
      const isBridge =
        router.currentRoute.value.matched.length > 0 && currentRouter.value.path === '/bridge';
      !isBridge && (await setupNetwork(chainId));
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
    const ss58 = currentEcdsaAccount.value.ss58 ?? '';
    const result = await loadMetaMask(ss58);
    if (result) {
      modalName.value = '';
      return;
    }
  };

  const toggleMetaMaskSchema = async () => {
    const accounts = await requestAccounts();
    const loadingAddr = accounts[0];
    const loginMsg = `Sign this message to login with address ${loadingAddr}`;
    const signature = await requestSignature(loginMsg, loadingAddr);
    const pubKey = utils.recoverPublicKeyFromSig(loadingAddr, loginMsg, signature);
    const ss58Address = utils.ecdsaPubKeyToSs58(pubKey, ASTAR_SS58_FORMAT);

    if (isH160.value) {
      store.commit('general/setIsH160Formatted', false);
      store.commit('general/setCurrentEcdsaAccount', {
        ethereum: loadingAddr,
        ss58: ss58Address,
      });
    } else {
      await loadMetaMask();
    }
  };

  const setWallet = (wallet: SupportWallet): void => {
    selectedWallet.value = wallet;
    modalName.value = wallet;
  };

  // Todo: Delete after the balance page is removed
  const setWalletModal = (wallet: SupportWallet): void => {
    setWallet(wallet);
  };

  const connectEthereumWallet = async (wallet: SupportWallet): Promise<void> => {
    const isWalletExtension = await checkIsWalletExtension();
    const deepLinkUrl = getDeepLinkUrl(wallet);
    const isOpenMobileDappBrowser = isMobileDevice && deepLinkUrl && !isWalletExtension;

    if (isOpenMobileDappBrowser) {
      window.open(deepLinkUrl);
      return;
    }
    if (wallet === SupportWallet.MetaMask) {
      setMetaMask();
      return;
    }
  };

  const selectLoginWallet = async (): Promise<void> => {
    const lookupWallet = castMobileSource(modalName.value);
    if (SubstrateWallets.find((it) => it === lookupWallet)) {
      const injected = await getInjectedExtensions();
      const isInstalledExtension = injected.find((it) => lookupWallet === it.name);

      if (!isInstalledExtension) {
        modalName.value = WalletModalOption.NoExtension;
        modalAccountSelect.value = false;
        return;
      }
      modalName.value = WalletModalOption.SelectSubstrateAccount;
      modalAccountSelect.value = true;
      return;
    }
  };

  const deepLinkLogin = async (): Promise<void> => {
    const isMetaMaskDeepLink = window.location.hash === deepLinkPath.metamask;
    const isWalletExtension = await checkIsWalletExtension();
    if (!isConnectedNetwork.value || !isWalletExtension) return;

    if (isMetaMaskDeepLink) {
      setTimeout(async () => {
        await setMetaMask();
      }, 800);
    }
  };

  const loginWithStoredAccount = async (): Promise<void> => {
    const address = localStorage.getItem(SELECTED_ADDRESS);
    const isBridge =
      router.currentRoute.value.matched.length > 0 && currentRouter.value.path === '/bridge';
    if (isBridge || currentRouter.value === undefined || !address || !isConnectedNetwork.value) {
      return;
    }

    // Memo: wait for updating the chain id from the initial state 592 (to pass the `setupNetwork` function)
    setTimeout(async () => {
      if (address === 'Ethereum Extension') {
        await setMetaMask();
      }
    }, 800);
    store.commit('general/setCurrentAddress', address);
  };

  const changeAccount = async (): Promise<void> => {
    const chosenWallet = selectedWallet.value;
    disconnectAccount();
    if (chosenWallet === SupportWallet.MetaMask) {
      openSelectModal();
    } else {
      setWallet(chosenWallet as SupportWallet);
    }
  };

  const changeEvmAccount = async (): Promise<void> => {
    if (!currentEcdsaAccount.value.ethereum || !window.ethereum || !isH160.value) {
      return;
    }
    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
      if (accounts[0] !== currentAccount.value) {
        disconnectAccount();
        await setMetaMask();
      }
    });
  };

  watchEffect(() => {
    initializeWalletAccount();
  });

  watchEffect(async () => {
    await changeEvmAccount();
  });

  watchEffect(async () => {
    await selectLoginWallet();
  });

  watchEffect(async () => {
    await loginWithStoredAccount();
  });

  watch(
    [isConnectedNetwork],
    async () => {
      await deepLinkLogin();
    },
    { immediate: true }
  );

  return {
    WalletModalOption,
    currentNetworkStatus,
    modalConnectWallet,
    currentAccount,
    currentAccountName,
    modalName,
    selectedWallet,
    modalAccountSelect,
    isH160,
    isConnectedNetwork,
    isEthWallet,
    openSelectModal,
    setCloseModal,
    setWalletModal,
    disconnectAccount,
    toggleMetaMaskSchema,
    changeAccount,
    connectEthereumWallet,
  };
};

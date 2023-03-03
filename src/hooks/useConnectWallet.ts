import { wait, ASTAR_SS58_FORMAT, checkSumEvmAddress } from '@astar-network/astar-sdk-core';
import { ETHEREUM_EXTENSION } from 'src/hooks';
import { useEvmAccount } from 'src/hooks/custom-signature/useEvmAccount';
import { $api } from 'boot/api';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import {
  SubstrateWallets,
  supportEvmWalletObj,
  SupportWallet,
  supportWalletObj,
  WalletModalOption,
} from 'src/config/wallets';
import { getChainId, setupNetwork } from 'src/config/web3';
import { useAccount, useNetworkInfo } from 'src/hooks';
import * as utils from 'src/hooks/custom-signature/utils';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { useExtensions } from 'src/hooks/useExtensions';
import { useMetaExtensions } from 'src/hooks/useMetaExtensions';
import { deepLinkPath } from 'src/links';
import { useStore } from 'src/store';
import {
  computed,
  ref,
  watch,
  WatchCallback,
  watchEffect,
  watchPostEffect,
  onUnmounted,
} from 'vue';
import { useRouter } from 'vue-router';
import {
  castMobileSource,
  checkIsWalletExtension,
  getDeepLinkUrl,
  getSelectedAccount,
  isMobileDevice,
} from 'src/hooks/helper/wallet';

export const useConnectWallet = () => {
  const { SELECTED_ADDRESS } = LOCAL_STORAGE;

  const modalConnectWallet = ref<boolean>(false);
  const modalAccountSelect = ref<boolean>(false);
  const selectedWallet = ref<string>('');
  const modalName = ref<string>('');

  const store = useStore();
  const { requestAccounts, requestSignature } = useEvmAccount();
  const { currentAccount, currentAccountName, disconnectAccount } = useAccount();
  const router = useRouter();

  const currentRouter = computed(() => router.currentRoute.value.matched[0]);
  const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const isEthWallet = computed(() => store.getters['general/isEthWallet']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const isConnectedNetwork = computed(() => store.getters['general/networkStatus'] === 'connected');
  const { currentNetworkIdx } = useNetworkInfo();

  const selectedWalletSource = computed(() => {
    try {
      const accounts = store.getters['general/substrateAccounts'];
      const selectedAccount = getSelectedAccount(accounts);
      return selectedAccount ? selectedAccount.source : null;
    } catch (error) {
      return null;
    }
  });

  const setCloseModal = (): void => {
    modalName.value = '';
  };

  const openSelectModal = (): void => {
    modalName.value = WalletModalOption.SelectWallet;
    return;
  };

  // Memo: triggered after users (who haven't connected to wallet) have clicked 'Connect Wallet' button on dApp staking page
  const handleOpenSelectModal = (): void => {
    window.addEventListener(WalletModalOption.SelectWallet, openSelectModal);
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

  const loadEvmWallet = async ({
    ss58,
    currentWallet,
  }: {
    ss58?: string;
    currentWallet: SupportWallet;
  }): Promise<boolean> => {
    const setCurrentEcdsaAccount = (address: string) => {
      const ethereumAddr = checkSumEvmAddress(address);
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
    };

    try {
      const accounts = await requestAccounts();

      accounts?.length && setCurrentEcdsaAccount(accounts[0]);

      const chainId = getChainId(currentNetworkIdx.value);

      const provider = getEvmProvider(currentWallet);

      if (!provider) {
        return false;
      }

      await setupNetwork({ network: chainId, provider });

      // If SubWallet return empty evm accounts, it required to switch to evm network and will request accounts again.
      // This setup will not require from version 0.4.8
      if (accounts?.length === 0 && currentWallet === SupportWallet.SubWalletEvm) {
        const reCheckAccounts = await requestAccounts();

        reCheckAccounts?.length && setCurrentEcdsaAccount(reCheckAccounts[0]);
      }

      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  };

  const setEvmWallet = async (wallet: SupportWallet): Promise<void> => {
    selectedWallet.value = wallet;
    let isEvmWalletAvailable = false;

    const evmWallet = supportEvmWalletObj[wallet as keyof typeof supportEvmWalletObj];
    if (wallet === evmWallet.source) {
      const provider = window[evmWallet.ethExtension as any];
      isEvmWalletAvailable = provider !== undefined;

      if (!isEvmWalletAvailable) {
        modalName.value = WalletModalOption.OutdatedWallet;
      }
    }

    if (!isEvmWalletAvailable && modalName.value !== WalletModalOption.OutdatedWallet) {
      modalName.value = WalletModalOption.NoExtension;
    }

    if (!isEvmWalletAvailable) {
      throw new Error(`Cannot detect ${wallet} EVM extension`);
    }

    const ss58 = currentEcdsaAccount.value.ss58 ?? '';
    let result = await loadEvmWallet({ ss58, currentWallet: wallet });
    // Todo: remove this code later
    // if (result) {
    //   modalName.value = '';
    //   return;
    // }
  };

  const toggleEvmWalletSchema = async () => {
    const accounts = await requestAccounts();
    const loadingAddr = checkSumEvmAddress(accounts[0]);
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
      await loadEvmWallet({ currentWallet: selectedWallet.value as SupportWallet });
    }
  };

  const setWallet = (wallet: SupportWallet): void => {
    selectedWallet.value = wallet;
    modalName.value = wallet;
  };

  const requestExtensionsIfFirstAccess = (wallet: SupportWallet): void => {
    if (localStorage.getItem(SELECTED_ADDRESS) === null) {
      const { extensions } = useExtensions($api!!, store);
      const { metaExtensions, extensionCount } = useMetaExtensions($api!!, extensions)!!;
      watchPostEffect(async () => {
        store.commit('general/setMetaExtensions', metaExtensions.value);
        store.commit('general/setExtensionCount', extensionCount.value);
        const isSubstrateWallet = supportWalletObj.hasOwnProperty(wallet);
        // Memo: displays accounts menu for users who use the portal first time
        if (isSubstrateWallet) {
          setWallet(wallet);
        }
      });
    }
  };

  const setWalletModal = (wallet: SupportWallet): void => {
    requestExtensionsIfFirstAccess(wallet);
    store.commit('general/setCurrentWallet', wallet);

    setWallet(wallet);
  };

  const connectEthereumWallet = async (wallet: SupportWallet): Promise<void> => {
    requestExtensionsIfFirstAccess(wallet);
    store.commit('general/setCurrentWallet', wallet);
    localStorage.setItem(LOCAL_STORAGE.SELECTED_WALLET, wallet);

    const isWalletExtension = await checkIsWalletExtension();
    const deepLinkUrl = getDeepLinkUrl(wallet);
    const isOpenMobileDappBrowser = isMobileDevice && deepLinkUrl && !isWalletExtension;

    if (isOpenMobileDappBrowser) {
      window.open(deepLinkUrl);
      return;
    }
    if (supportEvmWalletObj.hasOwnProperty(wallet)) {
      setEvmWallet(wallet);
      return;
    }
  };

  const selectLoginWallet = async (): Promise<void> => {
    const lookupWallet = castMobileSource(modalName.value);
    if (SubstrateWallets.find((it) => it === lookupWallet)) {
      const wallets = Object.keys(window.injectedWeb3);
      const isInstalledExtension = wallets.find((it) => lookupWallet === it);

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
      const loadTime = 800;
      await wait(loadTime);
      await setEvmWallet(SupportWallet.MetaMask);
    }
  };

  const loginWithStoredAccount = async (): Promise<void> => {
    const address = localStorage.getItem(SELECTED_ADDRESS);
    const wallet = localStorage.getItem(LOCAL_STORAGE.SELECTED_WALLET);

    if (currentRouter.value === undefined || !address || !isConnectedNetwork.value) {
      return;
    }

    store.commit('general/setCurrentWallet', wallet);

    // Memo: wait for updating the chain id from the initial state 592 (to pass the `setupNetwork` function)
    const delay = 3000;
    await wait(delay);

    if (address === ETHEREUM_EXTENSION) {
      if (!wallet) {
        return;
      }

      await setEvmWallet(wallet as SupportWallet);
    }
    store.commit('general/setCurrentAddress', address);
  };

  const changeAccount = async (): Promise<void> => {
    modalAccountSelect.value = true;
  };

  watchEffect(() => {
    initializeWalletAccount();
  });

  const changeEvmAccount: WatchCallback<[string, any, string, any]> = (
    [wallet, ecdsaAccount, account, h160],
    _,
    registerCleanup
  ) => {
    const provider = getEvmProvider(wallet as SupportWallet);

    if (!ecdsaAccount.ethereum || !provider || !h160) {
      return;
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts[0] !== account) {
        await disconnectAccount();
        await setEvmWallet(wallet as SupportWallet);
      }
    };

    provider.on('accountsChanged', handleAccountsChanged);

    registerCleanup(() => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
    });
  };

  watch([selectedWallet, currentEcdsaAccount, currentAccount, isH160], changeEvmAccount);
  watchEffect(handleOpenSelectModal);

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

  onUnmounted(() => {
    window.removeEventListener(WalletModalOption.SelectWallet, openSelectModal);
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
    isH160,
    isConnectedNetwork,
    isEthWallet,
    openSelectModal,
    setCloseModal,
    setWalletModal,
    disconnectAccount,
    toggleEvmWalletSchema,
    changeAccount,
    connectEthereumWallet,
  };
};

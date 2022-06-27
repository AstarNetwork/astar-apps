import { getEvmProvider } from 'src/hooks/helper/wallet';
import { getProviderIndex } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import {
  SubstrateWallets,
  supportEvmWalletObj,
  SupportWallet,
  WalletModalOption,
} from 'src/config/wallets';
import { getChainId, setupNetwork } from 'src/config/web3';
import { checkSumEvmAddress } from 'src/config/web3/utils/convert';
import { useAccount } from 'src/hooks';
import * as utils from 'src/hooks/custom-signature/utils';
import { deepLinkPath } from 'src/links';
import { useStore } from 'src/store';
import { computed, ref, watch, watchEffect, watchPostEffect, WatchCallback } from 'vue';
import { useRouter } from 'vue-router';
import { useEvmAccount } from './custom-signature/useEvmAccount';
import { useExtensions } from 'src/hooks/useExtensions';
import { useMetaExtensions } from 'src/hooks/useMetaExtensions';
import { wait } from './helper/common';
import { ASTAR_SS58_FORMAT } from './helper/plasmUtils';
import { $api } from 'boot/api';
import {
  castMobileSource,
  checkIsWalletExtension,
  getDeepLinkUrl,
  getInjectedExtensions,
  getSelectedAccount,
  isMobileDevice,
} from './helper/wallet';

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
      // This setep will not require from version 0.4.8
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

    if (wallet === SupportWallet.TalismanEvm) {
      isEvmWalletAvailable = window.talismanEth !== undefined;
    }

    if (wallet === SupportWallet.SubWalletEvm) {
      isEvmWalletAvailable = window.SubWallet !== undefined;
    }

    if (wallet === SupportWallet.MetaMask) {
      isEvmWalletAvailable = window.ethereum !== undefined;
    }

    if (!isEvmWalletAvailable) {
      if (wallet === SupportWallet.TalismanEvm) {
        modalName.value = WalletModalOption.OutdatedWallet;
        return;
      }

      if (wallet === SupportWallet.SubWalletEvm) {
        modalName.value = WalletModalOption.OutdatedWallet;
        return;
      }

      modalName.value = WalletModalOption.NoExtension;
      return;
    }
    const ss58 = currentEcdsaAccount.value.ss58 ?? '';

    let result = await loadEvmWallet({ ss58, currentWallet: wallet });

    if (result) {
      modalName.value = '';
      return;
    }
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
        setWallet(wallet);
      });
    }
  };

  // Todo: Delete after the balance page is removed
  const setWalletModal = (wallet: SupportWallet): void => {
    requestExtensionsIfFirstAccess(wallet);
    store.commit('general/setCurrentWallet', wallet);

    if (supportEvmWalletObj.hasOwnProperty(wallet)) {
      localStorage.setItem(LOCAL_STORAGE.ETHEREUM_WALLET, wallet);
    }

    setWallet(wallet);
  };

  const connectEthereumWallet = async (wallet: SupportWallet): Promise<void> => {
    requestExtensionsIfFirstAccess(wallet);
    store.commit('general/setCurrentWallet', wallet);

    if (supportEvmWalletObj.hasOwnProperty(wallet)) {
      localStorage.setItem(LOCAL_STORAGE.ETHEREUM_WALLET, wallet);
    }

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
      const injected = await getInjectedExtensions(true);
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
      const loadTime = 800;
      await wait(loadTime);
      await setEvmWallet(SupportWallet.MetaMask);
    }
  };

  const loginWithStoredAccount = async (): Promise<void> => {
    const address = localStorage.getItem(SELECTED_ADDRESS);
    const wallet = localStorage.getItem(LOCAL_STORAGE.ETHEREUM_WALLET);

    if (currentRouter.value === undefined || !address || !isConnectedNetwork.value) {
      return;
    }

    store.commit('general/setCurrentWallet', wallet);

    // Memo: wait for updating the chain id from the initial state 592 (to pass the `setupNetwork` function)
    const delay = 800;
    await wait(delay);

    if (address === 'Ethereum Extension') {
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
    toggleEvmWalletSchema,
    changeAccount,
    connectEthereumWallet,
  };
};

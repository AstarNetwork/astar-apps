import { get } from 'lodash-es';
import { wait, checkSumEvmAddress, astarChain, hasProperty } from '@astar-network/astar-sdk-core';
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
  const { SELECTED_ADDRESS, IS_LEDGER } = LOCAL_STORAGE;

  const modalAccountSelect = ref<boolean>(false);
  const modalPolkasafeSelect = ref<boolean>(false);
  const modalAccountUnificationSelect = ref<boolean>(false);
  const selectedWallet = ref<string>('');
  const modalName = ref<string>('');

  const store = useStore();
  const { requestAccounts } = useEvmAccount();
  const { currentAccount, currentAccountName, disconnectAccount } = useAccount();
  const router = useRouter();

  const currentRouter = computed(() => router.currentRoute.value.matched[0]);
  const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const isEthWallet = computed<boolean>(() => store.getters['general/isEthWallet']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const isConnectedNetwork = computed<boolean>(
    () => store.getters['general/networkStatus'] === 'connected'
  );
  const { currentNetworkIdx, currentNetworkChain } = useNetworkInfo();

  const selectedWalletSource = computed(() => {
    try {
      const accounts = store.getters['general/substrateAccounts'];
      const selectedAccount = getSelectedAccount(accounts);
      return selectedAccount ? selectedAccount.source : null;
    } catch (error) {
      return null;
    }
  });

  const openSelectModal = (): void => {
    modalName.value = WalletModalOption.SelectWallet;
    return;
  };

  const setModalPolkasafeSelect = (result: boolean): void => {
    modalPolkasafeSelect.value = result;
  };

  const openPolkasafeModal = (): void => {
    modalName.value = WalletModalOption.Polkasafe;
    modalPolkasafeSelect.value = true;
    return;
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
    isSetupNetwork,
  }: {
    ss58?: string;
    currentWallet: SupportWallet;
    isSetupNetwork: boolean;
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

      // Memo: Do not change the network for the Bridge page
      if (currentRouter.value.name !== 'Bridge') {
        isSetupNetwork && (await setupNetwork({ network: chainId, provider }));
      }

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

  const setEvmWallet = async (wallet: SupportWallet, isSetupNetwork = true): Promise<void> => {
    selectedWallet.value = wallet;
    let isEvmWalletAvailable = false;

    const evmWallet = supportEvmWalletObj[wallet as keyof typeof supportEvmWalletObj];
    if (wallet === evmWallet.source) {
      const provider = get(window, evmWallet.ethExtension);
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
    await loadEvmWallet({ ss58, currentWallet: wallet, isSetupNetwork });
  };

  const setWallet = (wallet: SupportWallet): void => {
    selectedWallet.value = wallet;
    modalName.value = wallet;
  };

  const requestExtensionsIfFirstAccess = async (wallet: SupportWallet): Promise<void> => {
    // Memo: displays accounts menu for users who use the portal first time
    const isSubstrateWallet = hasProperty(supportWalletObj, wallet);
    const storedAddress = localStorage.getItem(SELECTED_ADDRESS);
    const isFirstAccess = storedAddress === null || storedAddress === ETHEREUM_EXTENSION;

    if (isFirstAccess && isSubstrateWallet) {
      const { extensions } = useExtensions($api!!, store);
      const { metaExtensions, extensionCount } = useMetaExtensions($api!!, extensions)!!;
      watchPostEffect(async () => {
        if (isSubstrateWallet) {
          store.commit('general/setMetaExtensions', metaExtensions.value);
          store.commit('general/setExtensionCount', extensionCount.value);
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
    if (hasProperty(supportEvmWalletObj, wallet)) {
      // Memo: no need to switch network before the page is refreshed
      setEvmWallet(wallet, false);
      return;
    }
  };

  const setModalAccountSelect = (result: boolean): void => {
    modalAccountSelect.value = result;
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

    if (
      currentRouter.value === undefined ||
      !address ||
      !isConnectedNetwork.value ||
      currentAccount.value
    ) {
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
    } else {
      store.commit('general/setCurrentAddress', address);
    }
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

  // Memo: Ledger accounts are available on Astar only
  const handleCheckLedgerEnvironment = async (): Promise<void> => {
    const isLedger = localStorage.getItem(IS_LEDGER) === 'true';
    if (isLedger && currentNetworkChain.value && currentNetworkChain.value !== astarChain.ASTAR) {
      localStorage.setItem(IS_LEDGER, 'false');
      await disconnectAccount();
      window.location.reload();
    }
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

  watch([currentNetworkChain], handleCheckLedgerEnvironment);

  return {
    WalletModalOption,
    currentNetworkStatus,
    currentAccount,
    currentAccountName,
    modalName,
    selectedWallet,
    modalAccountSelect,
    modalPolkasafeSelect,
    isH160,
    isConnectedNetwork,
    isEthWallet,
    modalAccountUnificationSelect,
    openSelectModal,
    setWalletModal,
    disconnectAccount,
    connectEthereumWallet,
    openPolkasafeModal,
    setModalAccountSelect,
    setModalPolkasafeSelect,
  };
};

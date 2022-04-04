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
  isMobileDevice,
} from './helper/wallet';

export const useConnectWallet = () => {
  const modalConnectWallet = ref<boolean>(false);
  const modalAccountSelect = ref<boolean>(false);
  const selectedWallet = ref<string>('');
  const modalName = ref<string>('');

  const router = useRouter();
  const currentRouter = computed(() => router.currentRoute.value.matched[0]);

  const { requestAccounts, requestSignature } = useMetamask();
  const store = useStore();
  const { currentAccount, currentAccountName, disconnectAccount } = useAccount();
  const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const isConnectedNetwork = computed(() => store.getters['general/networkStatus'] === 'connected');

  const { SELECTED_ADDRESS } = LOCAL_STORAGE;

  const setCloseModal = () => {
    modalName.value = '';
  };

  const openSelectModal = () => {
    modalName.value = WalletModalOption.SelectWallet;
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
      const chainId = getChainId(currentNetworkIdx.value);
      const isBridge =
        router.currentRoute.value.matched.length > 0 && currentRouter.value.path === '/bridge';
      setTimeout(async () => {
        !isBridge && (await setupNetwork(chainId));
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

  const setWalletModal = async (wallet: SupportWallet): Promise<void> => {
    const isWalletExtension = await checkIsWalletExtension();
    const deepLinkUrl = getDeepLinkUrl(wallet);
    const isOpenMobileDappBrowser = isMobileDevice && deepLinkUrl && !isWalletExtension;

    if (isOpenMobileDappBrowser) {
      window.open(deepLinkUrl);
      return;
    }
    if (wallet === SupportWallet.MetaMask || wallet === SupportWallet.Wallet3) {
      setMetaMask();
      return;
    }
    setWallet(wallet);
  };

  watchEffect(async () => {
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
  });

  watchEffect(() => {
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
  });

  watch(
    [isConnectedNetwork],
    async () => {
      const isMetaMaskDeepLink = window.location.hash === deepLinkPath.metamask;

      const isWalletExtension = await checkIsWalletExtension();
      if (!isConnectedNetwork.value || !isWalletExtension) return;

      if (isMetaMaskDeepLink) {
        setTimeout(async () => {
          await setMetaMask();
        }, 800);
      }
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
    openSelectModal,
    setCloseModal,
    setWalletModal,
    disconnectAccount,
    toggleMetaMaskSchema,
  };
};

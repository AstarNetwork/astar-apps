import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SubstrateWallets, SupportWallet, WalletModalOption } from 'src/config/wallets';
import { getChainId, setupNetwork } from 'src/config/web3';
import { useAccount } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, ref, watchEffect, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMetamask } from './custom-signature/useMetamask';
import { castMobileSource, getInjectedExtensions, isMobileDevice } from './helper/wallet';
import * as utils from 'src/hooks/custom-signature/utils';
import { getProviderIndex } from 'src/config/chainEndpoints';
import { deepLink, deepLinkPath } from 'src/links';
import { ASTAR_SS58_FORMAT } from './helper/plasmUtils';

export const useConnectWallet = () => {
  const modalConnectWallet = ref<boolean>(false);
  const modalAccountSelect = ref<boolean>(false);
  const selectedWallet = ref<string>('');
  const modalName = ref<string>('');

  const router = useRouter();
  const currentRouter = router.currentRoute.value.matched[0];
  const isBridge = router.currentRoute.value.matched.length > 0 && currentRouter.path === '/bridge';

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

    if (isMobileDevice && !isMetamaskExtension) {
      window.open(deepLink.metamask);
      return;
    }
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

  const setWalletModal = (wallet: SupportWallet): void => {
    if (wallet === SupportWallet.MetaMask) {
      setMetaMask();
      return;
    }
    selectedWallet.value = wallet;
    modalName.value = wallet;
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
    if (isBridge || currentRouter === undefined || !address || !isConnectedNetwork.value) {
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
      if (isConnectedNetwork.value && isMetaMaskDeepLink) {
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

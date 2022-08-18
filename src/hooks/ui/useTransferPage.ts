import { endpointKey } from 'src/config/chainEndpoints';
import {
  useAccount,
  useBalance,
  useBreakpoints,
  useNetworkInfo,
  useTransferRouter,
} from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { Chain, checkIsRelayChain, XcmChain, xcmChains } from 'src/modules/xcm';
import { generateNativeAsset, xcmToken } from 'src/modules/xcm/tokens';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { computed, ref, watch, watchEffect } from 'vue';

export type RightUi = 'information' | 'select-chain' | 'select-token';

export function useTransferPage() {
  const isModalSelectChain = ref<boolean>(false);
  const isSelectFromChain = ref<boolean>(false);
  const isModalSelectToken = ref<boolean>(false);
  const rightUi = ref<RightUi>('information');
  const isLocalTransfer = ref<boolean>(true);
  const token = ref<Asset>();
  const { currentAccount } = useAccount();
  const { accountData } = useBalance(currentAccount);
  const store = useStore();
  const { screenSize, width } = useBreakpoints();
  const {
    chainFrom,
    chainTo,
    tokenSymbol,
    router,
    isTransferPage,
    redirect,
    mode,
    network,
    xcmOpponentChain,
  } = useTransferRouter();

  const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
  const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');
  const { nativeTokenSymbol, currentNetworkName, currentNetworkIdx } = useNetworkInfo();

  const isShibuya = computed<boolean>(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

  const isTransferNativeToken = computed<boolean>(() => {
    return tokenSymbol.value === nativeTokenSymbol.value.toLowerCase();
  });

  const getNetworkName = (chain?: string): string => {
    console.log('getNetworkName');
    const isNativeToken = tokenSymbol.value === nativeTokenSymbol.value.toLowerCase();
    const currentNetwork = currentNetworkName.value.toLowerCase();
    const defaultXcmBridgeForNative =
      currentNetworkIdx.value === endpointKey.ASTAR
        ? Chain.ACALA.toLowerCase()
        : Chain.KARURA.toLowerCase();

    if (chain) {
      // if: users select chain via SelectChain UI
      const isDuplicated = chain === chainFrom.value || chain === chainTo.value;
      const isAstarEvm = chain.includes('evm') || chainTo.value.includes('evm');
      // Todo: check: chainFrom
      if (isSelectFromChain.value) {
        const toNetwork = isDuplicated
          ? defaultXcmBridgeForNative
          : isAstarEvm
          ? chainTo.value
          : currentNetwork;
        return (chain + '-' + toNetwork).toLowerCase();
      } else {
        const fromNetwork = isDuplicated
          ? defaultXcmBridgeForNative
          : isAstarEvm
          ? chainFrom.value
          : currentNetwork;
        return (fromNetwork + '-' + chain).toLowerCase();
      }
    } else {
      const isAstarEvm = chainFrom.value.includes('evm') || chainTo.value.includes('evm');
      const originChain = isLocalTransfer.value
        ? ''
        : isNativeToken
        ? defaultXcmBridgeForNative
        : token.value?.originChain.toLowerCase();
      const selectedNetwork = isAstarEvm ? chainTo.value : currentNetwork;
      return (
        isLocalTransfer.value ? currentNetwork : originChain + '-' + selectedNetwork
      ).toLowerCase();
    }
  };

  const setIsLocalTransfer = (result: boolean): void => {
    isLocalTransfer.value = result;
    const mode = result ? 'local' : 'xcm';
    const network = getNetworkName();
    router.replace({
      path: '/assets/transfer',
      query: { token: tokenSymbol.value, network, mode },
    });
  };

  const setIsSelectFromChain = (result: boolean) => {
    isSelectFromChain.value = result;
  };

  const setToken = async (t: Asset): Promise<void> => {
    const network = getNetworkName();
    const mode = isLocalTransfer.value ? 'local' : 'xcm';
    router.replace({
      path: '/assets/transfer',
      query: { token: t.metadata.symbol.toLowerCase(), network, mode },
    });
    await setRightUi('information');
    isModalSelectToken.value && handleModalSelectToken({ isOpen: false });
  };

  const setChain = async (chain: string): Promise<void> => {
    const network = getNetworkName(chain);
    const selectedNetwork = network.split('-')[1].toLowerCase();
    const t =
      xcmToken[currentNetworkIdx.value].find((it) => {
        return it.originChain.toLowerCase() === selectedNetwork && it.isNativeToken;
      })?.symbol || nativeTokenSymbol.value;
    router.replace({
      path: '/assets/transfer',
      query: { token: t.toLowerCase(), network, mode: 'xcm' },
    });
    await setRightUi('information');
    isModalSelectChain.value && handleModalSelectChain({ isOpen: false });
  };

  const handleModalSelectChain = ({ isOpen }: { isOpen: boolean }): void => {
    isModalSelectChain.value = isOpen;
  };

  const handleModalSelectToken = ({ isOpen }: { isOpen: boolean }): void => {
    isModalSelectToken.value = isOpen;
  };

  const handleFinalizedCallback = (): void => {
    router.push('/assets');
  };

  const setRightUi = async (ui: RightUi): Promise<void> => {
    if (width.value > screenSize.md) {
      // Memo: tricky way to work with `cancelHighlight` function
      await wait(100);
      rightUi.value = ui;
    } else {
      if (ui === 'select-chain') {
        isModalSelectChain.value = true;
      }
      if (ui === 'select-token') {
        isModalSelectToken.value = true;
      }
    }
  };

  const cancelHighlight = async (e: any): Promise<void> => {
    const openClass = 'container--select-chain';
    if (isHighlightRightUi.value && e.target.className !== openClass) {
      await setRightUi('information');
    }
  };

  const handleUpdateXcmTokenAssets = (): void => {
    if (currentAccount.value) {
      store.dispatch('assets/getAssets', currentAccount.value);
    }
  };

  const handleDefaultConfig = (): void => {
    // Memo: avoid triggering this function whenever users go back to assets page
    if (!isTransferPage.value || !currentNetworkName.value) {
      return;
    }

    const symbol = tokenSymbol.value;
    const nativeTokenSymbolRef = nativeTokenSymbol.value;
    isLocalTransfer.value = mode.value === 'local';

    const isRedirect = !network.value
      .toLowerCase()
      .includes(currentNetworkName.value.toLowerCase());

    if (isRedirect) return redirect();

    token.value = generateNativeAsset(nativeTokenSymbolRef);
    const isFetchedAssets = xcmAssets.value && xcmAssets.value.assets.length !== 0;
    if (isFetchedAssets && symbol) {
      try {
        const isXcmAsset = symbol !== nativeTokenSymbolRef.toLowerCase();
        if (isXcmAsset) {
          token.value = xcmAssets.value.assets.find(
            (it) => it.metadata.symbol.toLowerCase() === symbol
          );
        }
        if (!token.value) throw Error('No token is found');
      } catch (error) {
        console.error('error', error);
        redirect();
      }
    }
  };

  const tokens = computed<Asset[]>(() => {
    let tokens: Asset[];
    if (!xcmAssets.value || !nativeTokenSymbol.value) return [];

    const nativeToken = generateNativeAsset(nativeTokenSymbol.value);
    let selectableTokens;
    if (isLocalTransfer.value) {
      selectableTokens = xcmAssets.value.assets;
      tokens = selectableTokens.filter(({ isXcmCompatible }) => isXcmCompatible);
      tokens.unshift(nativeToken);
    } else {
      const selectedNetwork = xcmOpponentChain.value;
      const isSelectedRelayChain = checkIsRelayChain(selectedNetwork);
      selectableTokens = xcmAssets.value.assets.filter(
        (it) => it.originChain.toLowerCase() === selectedNetwork.toLowerCase()
      );
      tokens = selectableTokens.filter(({ isXcmCompatible }) => isXcmCompatible);
      !isSelectedRelayChain && tokens.push(nativeToken);
    }

    return tokens;
  });

  const chains = computed<XcmChain[]>(() => {
    const relayChainId =
      currentNetworkIdx.value === endpointKey.ASTAR ? Chain.POLKADOT : Chain.KUSAMA;
    const disabledChain = [Chain.MOONBEAM];
    const selectableChains = xcmChains.filter((it) => {
      return it.relayChain === relayChainId && !disabledChain.includes(it.name);
    });
    selectableChains.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return selectableChains;
  });

  const selectableFromChains = computed<XcmChain[]>(() => {
    return chains.value.filter((it) => !it.name.includes('_evm'));
  });

  const selectableChains = computed<XcmChain[]>(() => {
    return isSelectFromChain.value ? selectableFromChains.value : chains.value;
  });

  watch([currentAccount], handleUpdateXcmTokenAssets, { immediate: true });
  watchEffect(handleDefaultConfig);

  watchEffect(() => {
    // console.log('chains', chains.value);
    // console.log('selectableChains', selectableChains.value);
  });

  return {
    isLocalTransfer,
    accountData,
    token,
    isHighlightRightUi,
    rightUi,
    isTransferNativeToken,
    isModalSelectChain,
    isModalSelectToken,
    isShibuya,
    xcmAssets,
    tokens,
    selectableChains,
    setRightUi,
    handleModalSelectToken,
    handleModalSelectChain,
    cancelHighlight,
    setIsLocalTransfer,
    handleFinalizedCallback,
    setToken,
    setChain,
    setIsSelectFromChain,
  };
}

import { Erc20Token } from 'src/modules/token';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { ethers } from 'ethers';
import { endpointKey } from 'src/config/chainEndpoints';
import { useAccount, useBalance, useNetworkInfo } from 'src/hooks';
import {
  checkIsSupportAstarNativeToken,
  removeEvmName,
  restrictedXcmNetwork,
  xcmChains,
  xcmToken,
} from 'src/modules/xcm';
import { Chain, XcmChain } from 'src/v2/models/XcmModels';
import { generateAssetFromEvmToken, generateNativeAsset } from 'src/modules/xcm/tokens';
import { useStore } from 'src/store';
import { Asset, astarChains } from 'src/v2/models';
import { computed, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { EvmAssets, XcmAssets } from 'src/store/assets/state';
import { capitalize } from '@astar-network/astar-sdk-core';
import { Path } from 'src/router';
import { productionOrigin } from 'src/links';

export const pathEvm = '-evm';
export type TransferMode = 'local' | 'xcm';
export const astarNetworks = ['astar', 'shiden', 'shibuya'];
export const astarNativeTokens = ['sdn', 'astr', 'sby'];
// e.g.: endpointKey.SHIDEN;
const disabledXcmChain: endpointKey | undefined = undefined;

export interface NetworkFromTo {
  from: string;
  to: string;
}

export function useTransferRouter() {
  const isLocalTransfer = ref<boolean>(true);
  const token = ref<Asset>();

  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const { currentAccount } = useAccount();
  const nativeTokenBalance = ref<number>(0);
  const { useableBalance } = useBalance(currentAccount);
  const tokenSymbol = computed<string>(() => route.query.token as string);
  const network = computed<string>(() => route.params.network as string);
  const mode = computed<TransferMode>(() => route.query.mode as TransferMode);
  const from = computed<string>(() => route.query.from as string);
  const to = computed<string>(() => route.query.to as string);
  const isTransferPage = computed<boolean>(() => route.fullPath.includes('transfer'));
  const isEvmBridge = computed<boolean>(() => {
    if (!isTransferPage.value || isLocalTransfer.value) return false;
    return to.value.includes(pathEvm);
  });
  const { nativeTokenSymbol, currentNetworkName, currentNetworkIdx, currentNetworkChain, isZkEvm } =
    useNetworkInfo();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
  const evmAssets = computed<EvmAssets>(() => store.getters['assets/getEvmAllAssets']);
  const xcmOpponentChain = computed<Chain>(() => {
    const chain = astarChains.includes(capitalize(from.value) as Chain) ? to.value : from.value;
    return capitalize(chain) as Chain;
  });

  const disabledXcmParachains = computed<Chain[] | string[]>(() => {
    const restrictedNetworksArray = restrictedXcmNetwork[currentNetworkChain.value] || [];
    if (restrictedNetworksArray.length === 0) return [];
    return restrictedNetworksArray
      .filter(({ isRestrictedFromEvm, isRestrictedFromNative }) =>
        isH160.value ? isRestrictedFromEvm : isRestrictedFromNative
      )
      .map(({ chain }) => chain);
  });

  const setNativeTokenBalance = (): void => {
    nativeTokenBalance.value = Number(ethers.utils.formatEther(useableBalance.value));
  };

  const redirect = (): void => {
    const token = nativeTokenSymbol.value.toLowerCase();
    router.push({
      path: `/${network.value}/assets/transfer`,
      query: { token, mode: 'local' },
    });
  };

  const reverseChain = (): void => {
    router.push({
      path: `/${network.value}/assets/transfer`,
      query: {
        ...route.query,
        from: to.value.toLowerCase(),
        to: from.value.toLowerCase(),
      },
    });
  };

  const defaultXcmBridgeForNative = computed<string>(() => {
    return currentNetworkIdx.value === endpointKey.ASTAR
      ? Chain.ACALA.toLowerCase()
      : Chain.KARURA.toLowerCase();
  });

  const monitorProhibitedPair = (): void => {
    if (!isTransferPage.value || isLocalTransfer.value || !from.value || !to.value) {
      return;
    }

    if (!isH160.value && from.value.includes(pathEvm)) {
      redirect();
    }

    const isAstarNativeTokenToAstarEvm =
      !isLocalTransfer.value &&
      to.value.includes(pathEvm) &&
      tokenSymbol.value.toLowerCase() === nativeTokenSymbol.value.toLowerCase();
    if (isAstarNativeTokenToAstarEvm) {
      router.replace({
        path: `/${network.value}/assets/transfer`,
        query: {
          ...route.query,
          token: tokens.value[0].metadata.symbol.toLowerCase(),
        },
      });
    }

    if (isH160.value) {
      const currentEvmNetwork = currentNetworkName.value.toLowerCase() + pathEvm;
      if (from.value !== currentEvmNetwork) {
        redirect();
      }
    } else {
      const fromChain = removeEvmName(from.value);
      const toChain = removeEvmName(to.value);
      const isSameNetwork = fromChain === toChain;
      if (isSameNetwork) {
        router.replace({
          path: `/${network.value}/assets/transfer`,
          query: {
            ...route.query,
            from: currentNetworkName.value.toLowerCase(),
            to: defaultXcmBridgeForNative.value,
          },
        });
      }
    }
  };

  const getFromToParams = ({
    chain,
    isSelectFromChain,
  }: {
    chain: string;
    isSelectFromChain: boolean;
  }): NetworkFromTo => {
    const isDuplicated = chain === from.value.toLowerCase() || chain === to.value.toLowerCase();
    const getValues = () => {
      if (isSelectFromChain) {
        const toParam = isDuplicated ? from.value : to.value;
        return { fromParam: chain, toParam: toParam.toLowerCase() };
      } else {
        const fromParam = isDuplicated ? to.value : from.value;
        return { fromParam: fromParam.toLowerCase(), toParam: chain };
      }
    };
    const { fromParam, toParam } = getValues();
    return checkIsAstarChain({ from: fromParam, to: toParam, isSelectFromChain });
  };

  // Memo: to avoid without selecting Astar/SDN e.g.: Karura <-> Moonriver
  const checkIsAstarChain = ({
    from,
    to,
    isSelectFromChain,
  }: {
    from: string;
    to: string;
    isSelectFromChain: boolean;
  }): { from: string; to: string } => {
    const isAstarEvm = from.includes(pathEvm) || to.includes(pathEvm);
    const currentNetworkNameRef = currentNetworkName.value.toLowerCase();
    const isAstrOrSdn =
      from.includes(currentNetworkNameRef) || to.includes(currentNetworkNameRef) || isAstarEvm;
    if (isAstrOrSdn) {
      return { from, to };
    } else {
      const f = isSelectFromChain ? from : currentNetworkNameRef;
      const t = !isSelectFromChain ? to : currentNetworkNameRef;
      return { from: f, to: t };
    }
  };

  const setIsLocalTransfer = ({
    isLocal,
    originChain,
  }: {
    isLocal: boolean;
    originChain: string;
  }): void => {
    isLocalTransfer.value = isLocal;
    const mode = isLocal ? 'local' : 'xcm';
    const isNativeAstarToken = tokenSymbol.value === nativeTokenSymbol.value.toLowerCase();

    const opponentNetwork = isNativeAstarToken
      ? defaultXcmBridgeForNative.value
      : originChain.toLowerCase();
    const astarNetwork = currentNetworkName.value.toLowerCase();
    const from = isH160.value ? astarNetwork + pathEvm : opponentNetwork.toLowerCase();
    const to = isH160.value ? opponentNetwork : astarNetwork;

    const query = isLocal
      ? { token: tokenSymbol.value, mode }
      : { token: tokenSymbol.value, from, to, mode };
    router.replace({
      path: `/${network.value}/assets/transfer`,
      query,
    });
  };

  const setToken = (t: Asset): void => {
    const mode = isLocalTransfer.value ? 'local' : 'xcm';
    const token = t.metadata.symbol.toLowerCase();
    const baseQuery = { token, mode };
    const xcmQuery = {
      ...baseQuery,
      from: from.value,
      to: to.value,
    };
    router.replace({
      path: `/${network.value}/assets/transfer`,
      query: isLocalTransfer.value ? baseQuery : xcmQuery,
    });
  };

  const setChain = ({
    chain,
    isSelectFromChain,
  }: {
    chain: string;
    isSelectFromChain: boolean;
  }): void => {
    const { from, to } = getFromToParams({
      chain: chain.toLowerCase(),
      isSelectFromChain: isSelectFromChain,
    });
    const tokens = xcmToken[currentNetworkIdx.value].filter((it) => {
      const originChain = it.originChain.toLowerCase();
      return originChain === to || originChain === from;
    });
    const originChainNativeToken = tokens.find((it) => it.isNativeToken);
    const t =
      (originChainNativeToken ? originChainNativeToken.symbol : tokens[0].symbol) ||
      nativeTokenSymbol.value;

    const isAstarEvm = chain.includes(pathEvm);
    const token = isAstarEvm ? tokenSymbol.value : t.toLowerCase();
    router.replace({
      path: `/${network.value}/assets/transfer`,
      query: { ...route.query, token, from, to, mode: 'xcm' },
    });
  };

  const tokens = computed<Asset[]>(() => {
    let tokens: Asset[] = [];
    let selectableTokens;
    const bal = nativeTokenBalance.value;
    const nativeToken = generateNativeAsset(nativeTokenSymbol.value);
    const nativeTokenAsset = { ...nativeToken, userBalance: bal };
    const evmTokens = evmAssets.value.assets;

    if (isLocalTransfer.value) {
      if (isH160.value) {
        // if: H160 local transfer
        if (!evmTokens) return [];
        const selectableTokens = evmTokens;
        tokens = selectableTokens
          .map((it) => {
            if (it.symbol !== nativeTokenSymbol.value) {
              return generateAssetFromEvmToken(it as Erc20Token, xcmAssets.value.assets);
            } else {
              return undefined;
            }
          })
          .filter((it) => it !== undefined) as Asset[];
        tokens.push(nativeTokenAsset);
      } else {
        // if: SS58 local transfer
        if (!xcmAssets.value || !nativeTokenSymbol.value) return [];
        selectableTokens = xcmAssets.value.assets;
        tokens = selectableTokens.filter(
          ({ isXcmCompatible, userBalance }) => isXcmCompatible || userBalance
        );
        tokens.push(nativeTokenAsset);
      }
    }

    if (!isLocalTransfer.value) {
      // if: XCM bridge
      const selectedNetwork = xcmOpponentChain.value;
      const isAstarEvm = from.value.includes(pathEvm) || to.value.includes(pathEvm);
      const isSupportAstarNativeToken = checkIsSupportAstarNativeToken(selectedNetwork);
      if (isH160.value) {
        const filteredToken = evmTokens.map((it) =>
          generateAssetFromEvmToken(it as Erc20Token, xcmAssets.value.assets)
        );
        selectableTokens = filteredToken
          .filter(({ isXcmCompatible }) => isXcmCompatible)
          .filter((it) => it.originChain === selectedNetwork);
      } else {
        selectableTokens = xcmAssets.value.assets.filter(
          (it) => it.originChain === selectedNetwork
        );
      }
      tokens = selectableTokens.filter(({ isXcmCompatible }) => isXcmCompatible);
      !isAstarEvm && isSupportAstarNativeToken && tokens.push(nativeTokenAsset);
    }
    return tokens.length > 0
      ? tokens.sort((a: Asset, b: Asset) => a.metadata.symbol.localeCompare(b.metadata.symbol))
      : [];
  });

  const handleDefaultConfig = (): void => {
    // Memo: avoid triggering this function whenever users go back to assets page
    if (!isTransferPage.value || !currentNetworkName.value) {
      return;
    }

    const isCustomNetwork = network.value === providerEndpoints[endpointKey.CUSTOM].networkAlias;
    isLocalTransfer.value = mode.value === 'local';
    const isRedirect =
      !isCustomNetwork &&
      !isZkEvm.value &&
      !network.value.toLowerCase().includes(currentNetworkName.value.toLowerCase());

    if (isRedirect) return redirect();

    const nativeBal = nativeTokenBalance.value;
    const nativeToken = generateNativeAsset(nativeTokenSymbol.value);
    const nativeTokenAsset = { ...nativeToken, userBalance: nativeBal };
    token.value = nativeTokenAsset;
    token.value = tokens.value.find(
      (it) => it.metadata.symbol.toLowerCase() === tokenSymbol.value.toLowerCase()
    );
  };

  const chains = computed<XcmChain[]>(() => {
    const relayChainId =
      currentNetworkIdx.value === endpointKey.ASTAR ? Chain.POLKADOT : Chain.KUSAMA;
    const selectableChains = xcmChains.filter((it) => {
      return it.relayChain === relayChainId;
    });
    selectableChains.sort((a, b) => a.name.localeCompare(b.name));
    return selectableChains;
  });

  const handleIsFoundToken = (): void => {
    const isFetchedXcmAssets = xcmAssets.value.assets.length > 0;
    if (isFetchedXcmAssets && tokenSymbol.value) {
      const isFound = tokens.value.find(
        (it) => it.metadata.symbol.toLowerCase() === tokenSymbol.value.toLowerCase()
      );
      !isFound && redirect();
    }
  };

  const checkIsDisabledToken = (originChain: string): boolean => {
    if (!originChain) return false;
    return !!disabledXcmParachains.value.find((it) => it === originChain);
  };

  const isDisableXcmEnvironment = computed<boolean>(() => {
    const isProductionPage = window.location.origin === productionOrigin;
    const isStagingOrDevPage = !isProductionPage;
    if (isStagingOrDevPage) {
      return false;
    }

    const isDisabledXcmChain = disabledXcmChain === currentNetworkIdx.value;
    const originChain = token.value?.originChain || '';
    return checkIsDisabledToken(originChain) || isDisabledXcmChain;
  });

  const checkIsDisabledXcmChain = (from: string, to: string): boolean => {
    if (!from || !to) return false;
    const chains = disabledXcmParachains.value.map((it) => it.toLowerCase());
    const isDisabled = chains.find((it) => it === from.toLowerCase() || it === to.toLowerCase());
    return !!isDisabled || isDisableXcmEnvironment.value;
  };

  // Memo: redirect to the assets page if users access to the XCM transfer page by inputting URL directly
  const handleDisableXcmTransfer = (): void => {
    if (checkIsDisabledXcmChain(from.value, to.value) && mode.value === 'xcm') {
      router.push(Path.Assets);
    }
  };

  watchEffect(handleDefaultConfig);
  watchEffect(monitorProhibitedPair);
  watch([currentAccount, isH160, xcmAssets], handleIsFoundToken, { immediate: false });
  watchEffect(setNativeTokenBalance);
  watchEffect(handleDisableXcmTransfer);

  return {
    tokenSymbol,
    network,
    mode,
    xcmOpponentChain,
    isTransferPage,
    router,
    route,
    isEvmBridge,
    isLocalTransfer,
    from,
    to,
    token,
    tokens,
    chains,
    isDisableXcmEnvironment,
    redirect,
    reverseChain,
    getFromToParams,
    setIsLocalTransfer,
    setToken,
    setChain,
  };
}

import { ethers } from 'ethers';
import { SelectedToken } from 'src/c-bridge';
import { endpointKey } from 'src/config/chainEndpoints';
import { useAccount, useBalance, useNetworkInfo } from 'src/hooks';
import {
  astarChains,
  Chain,
  checkIsRelayChain,
  removeEvmName,
  XcmChain,
  xcmChains,
  xcmToken,
} from 'src/modules/xcm';
import { generateAssetFromEvmToken, generateNativeAsset } from 'src/modules/xcm/tokens';
import { useStore } from 'src/store';
import { Asset } from 'src/v2/models';
import { computed, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { EvmAssets, XcmAssets } from './../../store/assets/state';
import { capitalize } from './../helper/common';

export const pathEvm = '-evm';
export type TransferMode = 'local' | 'xcm';
export const astarNetworks = ['astar', 'shiden', 'shibuya'];
export const astarNativeTokens = ['sdn', 'astr', 'sby'];
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
  // Todo: move to GlobalState
  const { currentAccount } = useAccount();
  const nativeTokenBalance = ref<number>(0);
  const { useableBalance } = useBalance(currentAccount);
  const tokenSymbol = computed<string>(() => route.query.token as string);
  const network = computed<string>(() => route.query.network as string);
  const mode = computed<TransferMode>(() => route.query.mode as TransferMode);
  const from = computed<string>(() => route.query.from as string);
  const to = computed<string>(() => route.query.to as string);
  const isTransferPage = computed<boolean>(() => route.fullPath.includes('transfer'));
  const isEvmBridge = computed<boolean>(() => {
    if (!isTransferPage.value || isLocalTransfer.value) return false;
    return to.value.includes(pathEvm);
  });
  const { nativeTokenSymbol, currentNetworkName, currentNetworkIdx } = useNetworkInfo();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
  const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
  const evmAssets = computed<EvmAssets>(() => store.getters['assets/getEvmAllAssets']);
  const xcmOpponentChain = computed<Chain>(() => {
    const chain = astarChains.includes(capitalize(from.value) as Chain) ? to.value : from.value;
    return capitalize(chain) as Chain;
  });

  const setNativeTokenBalance = (): void => {
    nativeTokenBalance.value = Number(ethers.utils.formatEther(useableBalance.value));
  };

  const redirect = (): void => {
    const token = nativeTokenSymbol.value.toLowerCase();
    const network = currentNetworkName.value.toLowerCase();
    router.push({
      path: '/assets/transfer',
      query: { token, network, mode: 'local' },
    });
  };

  const reverseChain = (): void => {
    router.push({
      path: '/assets/transfer',
      query: {
        ...route.query,
        from: to.value.toLowerCase(),
        to: from.value.toLowerCase(),
      },
    });
  };

  // Memo: configure the token data since astar native token is not supported on the Relaychain
  const redirectForRelaychain = (): void => {
    if (!isTransferPage.value || !xcmOpponentChain.value) return;
    try {
      const isRelaychain = checkIsRelayChain(xcmOpponentChain.value);
      if (!isRelaychain || mode.value !== 'xcm') return;

      const relayChainToken = xcmToken[currentNetworkIdx.value]
        .find((it) => it.originChain === xcmOpponentChain.value)
        ?.symbol.toLowerCase();
      if (!relayChainToken) return;
      if (tokenSymbol.value !== relayChainToken) {
        router.replace({
          path: '/assets/transfer',
          query: {
            ...route.query,
            token: relayChainToken?.toLowerCase(),
            network: network.value,
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
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
          path: '/assets/transfer',
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
    const network = currentNetworkName.value.toLowerCase();
    const isNativeAstarToken = tokenSymbol.value === nativeTokenSymbol.value.toLowerCase();
    const defaultXcmBridgeForNative =
      currentNetworkIdx.value === endpointKey.ASTAR ? Chain.ACALA : Chain.KARURA;

    const opponentNetwork = isNativeAstarToken
      ? defaultXcmBridgeForNative
      : originChain.toLowerCase();
    const astarNetwork = currentNetworkName.value.toLowerCase();
    const from = isH160.value ? astarNetwork + pathEvm : opponentNetwork.toLowerCase();
    const to = isH160.value ? opponentNetwork : astarNetwork;

    const query = isLocal
      ? { token: tokenSymbol.value, network, mode }
      : { token: tokenSymbol.value, network, from, to, mode };
    router.replace({
      path: '/assets/transfer',
      query,
    });
  };

  const setToken = (t: Asset): void => {
    const network = currentNetworkName.value.toLowerCase();
    const mode = isLocalTransfer.value ? 'local' : 'xcm';
    const token = t.metadata.symbol.toLowerCase();
    const baseQuery = { token, network, mode };
    const xcmQuery = {
      ...baseQuery,
      from: from.value,
      to: to.value,
    };
    router.replace({
      path: '/assets/transfer',
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
    const network = currentNetworkName.value.toLowerCase();
    const t =
      xcmToken[currentNetworkIdx.value]
        .filter((it) => {
          const originChain = it.originChain.toLowerCase();
          return originChain === to || originChain === from;
        })
        .find((it) => it.isNativeToken)?.symbol || nativeTokenSymbol.value;

    const isAstarEvm = chain.includes(pathEvm);
    const token = isAstarEvm ? tokenSymbol.value : t.toLowerCase();
    router.replace({
      path: '/assets/transfer',
      query: { ...route.query, token, network, from, to, mode: 'xcm' },
    });
  };

  const tokens = computed<Asset[]>(() => {
    let tokens;
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
        tokens = selectableTokens.map((it) =>
          generateAssetFromEvmToken(it as SelectedToken, xcmAssets.value.assets)
        );
        tokens.push(nativeTokenAsset);
      } else {
        // if: SS58 local transfer
        if (!xcmAssets.value || !nativeTokenSymbol.value) return [];
        selectableTokens = xcmAssets.value.assets;
        tokens = selectableTokens.filter(({ isXcmCompatible }) => isXcmCompatible);
        tokens.push(nativeTokenAsset);
      }
    }

    if (!isLocalTransfer.value) {
      // if: XCM bridge
      const selectedNetwork = xcmOpponentChain.value;
      const isSelectedRelayChain = checkIsRelayChain(selectedNetwork);
      if (isH160.value) {
        const filteredToken = evmTokens.map((it) =>
          generateAssetFromEvmToken(it as SelectedToken, xcmAssets.value.assets)
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
      !isSelectedRelayChain && tokens.push(nativeTokenAsset);
    }
    return tokens ? tokens.sort((a, b) => a.metadata.symbol.localeCompare(b.metadata.symbol)) : [];
  });

  const handleDefaultConfig = (): void => {
    // Memo: avoid triggering this function whenever users go back to assets page
    if (!isTransferPage.value || !currentNetworkName.value) {
      return;
    }

    isLocalTransfer.value = mode.value === 'local';
    const isRedirect = !network.value
      .toLowerCase()
      .includes(currentNetworkName.value.toLowerCase());

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
      // Memo: temporary suspend acala tokens
      return it.relayChain === relayChainId && it.name !== Chain.ACALA;
    });
    selectableChains.sort((a, b) => a.name.localeCompare(b.name));
    return selectableChains;
  });

  watchEffect(handleDefaultConfig);
  watchEffect(redirectForRelaychain);
  watchEffect(monitorProhibitedPair);

  watch(
    [currentAccount, isH160],
    () => {
      if (tokens.value.length > 0 && tokenSymbol.value) {
        const isFound = tokens.value.find(
          (it) => it.metadata.symbol.toLowerCase() === tokenSymbol.value.toLowerCase()
        );
        !isFound && redirect();
      }
    },
    { immediate: false }
  );

  watchEffect(setNativeTokenBalance);

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
    redirect,
    reverseChain,
    getFromToParams,
    setIsLocalTransfer,
    setToken,
    setChain,
  };
}

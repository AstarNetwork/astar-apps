import { endpointKey } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { Chain } from 'src/modules/xcm';
import { useStore } from 'src/store';
import { computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { capitalize } from './../helper/common';

export type TransferMode = 'local' | 'local-evm' | 'xcm';

export interface NetworkFromTo {
  from: string;
  to: string;
}

export function useTransferRouter() {
  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const tokenSymbol = computed<string>(() => route.query.token as string);
  const network = computed<string>(() => route.query.network as string);
  const mode = computed<TransferMode>(() => route.query.mode as TransferMode);
  const from = computed<string>(() => route.query.from as string);
  const to = computed<string>(() => route.query.to as string);
  const isTransferPage = computed<boolean>(() => route.fullPath.includes('transfer'));
  const isEvmBridge = computed<boolean>(() => {
    if (!isTransferPage.value) return false;
    return to.value.includes('evm');
  });
  const { nativeTokenSymbol, currentNetworkName, currentNetworkIdx } = useNetworkInfo();
  const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

  const xcmOpponentChain = computed<Chain>(() => {
    const AstarChain = [Chain.ASTAR, Chain.SHIDEN];
    if (AstarChain.includes(capitalize(from.value) as Chain)) {
      return capitalize(to.value) as Chain;
    } else {
      return capitalize(from.value) as Chain;
    }
  });

  const redirect = (): void => {
    const token = nativeTokenSymbol.value.toLowerCase();
    const network = currentNetworkName.value.toLowerCase();
    const mode = isH160.value ? 'local-evm' : 'local';
    router.push({
      path: '/assets/transfer',
      query: { token, network, mode },
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

  // Todo: check if this is necessary
  // const redirectForRelaychain = (): void => {
  //   if (!isTransferPage.value) return;
  //   try {
  //     const isRelaychain = checkIsRelayChain(xcmOpponentChain.value);
  //     if (!isRelaychain || mode.value !== 'xcm') return;

  //     const relayChainToken = xcmToken[currentNetworkIdx.value]
  //       .find((it) => it.originChain === xcmOpponentChain.value)
  //       ?.symbol.toLowerCase();
  //     if (tokenSymbol.value !== relayChainToken) {
  //       router.replace({
  //         path: '/assets/transfer',
  //         query: {
  //           ...route.query,
  //           token: relayChainToken?.toLowerCase(),
  //           network: network.value,
  //           mode: 'xcm',
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // Memo: to avoid without selecting Astar/SDN e.g.: Karura <-> Moonriver
  const setDestChainToAstar = (): void => {
    if (!isTransferPage.value || mode.value !== 'xcm') return;
    const isAstarEvm = from.value.includes('evm') || to.value.includes('evm');
    const currentNetworkNameRef = currentNetworkName.value.toLowerCase();
    const isAstrOrSdn =
      from.value.includes(currentNetworkNameRef) ||
      to.value.includes(currentNetworkNameRef) ||
      isAstarEvm;
    if (!isAstrOrSdn) {
      router.replace({
        path: '/assets/transfer',
        query: {
          ...route.query,
          to: currentNetworkNameRef.toLowerCase(),
        },
      });
    }
  };

  const getFromToParams = ({
    chain,
    isSelectFromChain,
  }: {
    chain: string;
    isSelectFromChain: boolean;
  }): NetworkFromTo => {
    const defaultXcmBridgeForNative =
      currentNetworkIdx.value === endpointKey.ASTAR
        ? Chain.ACALA.toLowerCase()
        : Chain.KARURA.toLowerCase();

    const isDuplicated = chain === from.value || chain === to.value;
    if (isSelectFromChain) {
      const toParam = isDuplicated ? defaultXcmBridgeForNative : to.value;
      return { from: chain.toLowerCase(), to: toParam.toLowerCase() };
    } else {
      const fromParam = isDuplicated ? defaultXcmBridgeForNative : from.value;
      return { from: fromParam.toLowerCase(), to: chain.toLowerCase() };
    }
  };

  // watchEffect(redirectForRelaychain);
  watchEffect(setDestChainToAstar);

  watchEffect(() => {
    console.log('useTransferRouter');
    console.log('from', from.value);
    console.log('to', to.value);
  });

  return {
    tokenSymbol,
    network,
    mode,
    xcmOpponentChain,
    isTransferPage,
    router,
    isEvmBridge,
    redirect,
    reverseChain,
    from,
    to,
    getFromToParams,
  };
}

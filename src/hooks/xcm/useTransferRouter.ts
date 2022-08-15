import { useNetworkInfo } from 'src/hooks';
import { Chain, xcmToken } from 'src/modules/xcm';
import { computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { checkIsRelayChain } from './../../modules/xcm/utils/index';
import { capitalize } from './../helper/common';

export type TransferMode = 'local' | 'xcm';

export function useTransferRouter() {
  const router = useRouter();
  const tokenSymbol = computed<string>(() => router.currentRoute.value.query.token as string);
  const network = computed<string>(() => router.currentRoute.value.query.network as string);
  const mode = computed<TransferMode>(() => router.currentRoute.value.query.mode as TransferMode);
  const isTransferPage = computed<boolean>(() =>
    router.currentRoute.value.fullPath.includes('transfer')
  );
  const { nativeTokenSymbol, currentNetworkName, currentNetworkIdx } = useNetworkInfo();

  const chainFrom = computed<Chain>(() => {
    let chain;
    if (mode.value === 'xcm') {
      chain = capitalize(network.value.split('-')[0].toLowerCase());
    } else {
      chain = capitalize(network.value);
    }
    return chain as Chain;
  });

  const chainTo = computed<Chain>(() => {
    let chain;
    if (mode.value === 'xcm') {
      chain = capitalize(network.value.split('-')[1].toLowerCase());
    } else {
      chain = capitalize(network.value);
    }
    return chain as Chain;
  });

  const xcmOpponentChain = computed<Chain>(() => {
    const AstarChain = [Chain.ASTAR, Chain.SHIDEN];
    if (AstarChain.includes(chainFrom.value)) {
      return chainTo.value;
    } else {
      return chainFrom.value;
    }
  });

  const redirect = (): void => {
    const token = nativeTokenSymbol.value.toLowerCase();
    const network = currentNetworkName.value.toLowerCase();
    router.push({
      path: '/assets/transfer',
      query: { token, network, mode: 'local' },
    });
  };

  const redirectForRelaychain = (): void => {
    if (!isTransferPage.value) return;
    try {
      const isRelaychain = checkIsRelayChain(xcmOpponentChain.value);
      if (!isRelaychain || mode.value !== 'xcm') return;

      const relayChainToken = xcmToken[currentNetworkIdx.value]
        .find((it) => it.originChain === xcmOpponentChain.value)
        ?.symbol.toLowerCase();
      if (tokenSymbol.value !== relayChainToken) {
        router.replace({
          path: '/assets/transfer',
          query: { token: relayChainToken, network: network.value, mode: mode.value },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  watchEffect(redirectForRelaychain);

  return {
    tokenSymbol,
    network,
    mode,
    chainFrom,
    chainTo,
    xcmOpponentChain,
    isTransferPage,
    router,
    redirect,
  };
}

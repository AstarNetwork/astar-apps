import {
  ChainProvider,
  endpointKey,
  getNetworkName,
  providerEndpoints,
} from 'src/config/chainEndpoints';
import { Path } from 'src/router/routes';
import { computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LOCAL_STORAGE } from 'src/config/localStorage';

const { NETWORK_IDX, SELECTED_ENDPOINT } = LOCAL_STORAGE;

export function useAppRouter() {
  const router = useRouter();
  const route = useRoute();
  const network = computed<string>(() => route.params.network as string);

  const castNetworkName = (networkParam: string): string => {
    let name = networkParam.toLowerCase();
    if (name === 'shibuya') {
      name = providerEndpoints[endpointKey.SHIBUYA].networkAlias;
    }
    const selectedChain = !!providerEndpoints.find((it) => it.networkAlias === name);
    return selectedChain ? name : '';
  };

  // Memo: this function is invoked whenever users change the `:network` param via browser's address bar
  const handleInputNetworkParam = (): void => {
    const networkIdxStore = localStorage.getItem(NETWORK_IDX);
    if (!network.value) return;

    const chain = providerEndpoints.find(
      (it) => it.networkAlias === network.value
    ) as ChainProvider;
    const selectedChain = chain ? chain : providerEndpoints[0];

    const index = providerEndpoints
      .map((it) => it.networkAlias)
      .indexOf(selectedChain.networkAlias);

    const endpointIdx = String(index);
    const storedNetworkAlias = getNetworkName(Number(networkIdxStore));
    const networkParam = castNetworkName(network.value);

    const isReload =
      networkIdxStore === null ||
      networkIdxStore === undefined ||
      storedNetworkAlias !== networkParam;
    if (isReload) {
      localStorage.setItem(
        SELECTED_ENDPOINT,
        JSON.stringify({ [endpointIdx]: selectedChain.endpoints[0].endpoint })
      );
      localStorage.setItem(NETWORK_IDX, endpointIdx);
      if (network.value === networkParam) {
        window.location.reload();
      } else {
        const redirectNetwork =
          network.value.toLowerCase() === 'shibuya' ? endpointKey.SHIBUYA : endpointKey.ASTAR;
        router.push('/' + providerEndpoints[redirectNetwork].networkAlias + Path.Assets);
      }
    }
  };

  watchEffect(handleInputNetworkParam);
}

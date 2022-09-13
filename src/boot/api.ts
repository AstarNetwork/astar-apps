import { SubstrateAccount } from 'src/store/general/state';
import { ApiPromise } from '@polkadot/api';
import { keyring } from '@polkadot/ui-keyring';
import { useMeta } from 'quasar';
import { boot } from 'quasar/wrappers';
import { connectApi } from 'src/config/api/polkadot/connectApi';
import {
  ASTAR_CHAIN,
  endpointKey,
  getProviderIndex,
  providerEndpoints,
} from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { opengraphMeta } from 'src/config/opengraph';
import { createAstarWeb3Instance, TNetworkId } from 'src/config/web3';
import { objToArray, getRandomFromArray } from 'src/hooks/helper/common';
import { isMobileDevice } from 'src/hooks/helper/wallet';
import { useChainInfo } from 'src/hooks/useChainInfo';
import { useExtensions } from 'src/hooks/useExtensions';
import { useMetaExtensions } from 'src/hooks/useMetaExtensions';
import { computed, ref, watchPostEffect } from 'vue';
import Web3 from 'web3';

let $api: ApiPromise | undefined;
const $endpoint = ref<string>('');
const $web3 = ref<Web3>();

export default boot(async ({ store }) => {
  const { NETWORK_IDX, CUSTOM_ENDPOINT, SELECTED_ENDPOINT, SELECTED_ADDRESS } = LOCAL_STORAGE;

  const networkIdxStore = localStorage.getItem(NETWORK_IDX);
  const customEndpoint = localStorage.getItem(CUSTOM_ENDPOINT);
  const selectedEndpointData = localStorage.getItem(SELECTED_ENDPOINT);
  if (!selectedEndpointData) {
    localStorage.setItem(
      LOCAL_STORAGE.SELECTED_ENDPOINT,
      JSON.stringify({ '0': providerEndpoints[0].endpoints[0].endpoint })
    );
  }
  const selectedAddress = localStorage.getItem(SELECTED_ADDRESS);
  const selectedEndpoint = selectedEndpointData ? JSON.parse(selectedEndpointData) : {};
  if (networkIdxStore) {
    store.commit('general/setCurrentNetworkIdx', Number(networkIdxStore));
  }
  if (customEndpoint) {
    store.commit('general/setCurrentCustomEndpoint', customEndpoint);
  }
  const networkIdx = computed(() => store.getters['general/networkIdx']);
  const randomEndpoint = getRandomFromArray(providerEndpoints[networkIdx.value].endpoints).endpoint;
  let endpoint = selectedEndpoint.hasOwnProperty(networkIdx.value)
    ? selectedEndpoint[networkIdx.value]
      ? selectedEndpoint[networkIdx.value]
      : randomEndpoint
    : randomEndpoint;
  if (networkIdx.value === endpointKey.CUSTOM) {
    const customEndpoint = computed(() => store.getters['general/customEndpoint']);
    endpoint = customEndpoint.value;
  }

  if (networkIdx.value === endpointKey.LOCAL) {
    endpoint = providerEndpoints[networkIdx.value].endpoints[0].endpoint;
  }

  // set metadata header
  const favicon = providerEndpoints[Number(networkIdx.value)].favicon;
  useMeta({
    title: '',
    titleTemplate: (title) => `${title} | Astar Portal - Astar & Shiden Network`,
    htmlAttr: { lang: 'en' },
    link: {
      material: {
        rel: 'icon',
        href: favicon,
      },
    },
    meta: opengraphMeta,
  });
  let { api } = await connectApi(endpoint, networkIdx.value, store);
  $api = api;
  $endpoint.value = endpoint;

  const seen = new Set();
  const accountMap: SubstrateAccount[] = [];
  keyring.accounts.subject.subscribe((accounts) => {
    if (accounts) {
      const accountArray = objToArray(accounts);
      accountArray.forEach((account) => {
        const { address, meta } = account.json;
        const source = meta.source;
        const addressWithSource = address + source;
        const isSeen = seen.has(addressWithSource);

        if (!isSeen) {
          const data = {
            address,
            name: meta.name.replace('\n              ', ''),
            source,
          };

          seen.add(addressWithSource);
          accountMap.push(data);
          store.commit('general/setSubstrateAccounts', accountMap);
        }
      });
    }
  });

  // update chaininfo
  const { chainInfo } = useChainInfo(api);
  watchPostEffect(async () => {
    store.commit('general/setChainInfo', chainInfo.value);
    if (chainInfo.value?.chain) {
      const currentChain = chainInfo.value?.chain as ASTAR_CHAIN;
      const currentNetworkIdx = getProviderIndex(currentChain);
      const web3 = await createAstarWeb3Instance(currentNetworkIdx as TNetworkId);
      if (!web3) {
        console.error(`cannot create the web3 instance with network id ${currentNetworkIdx}`);
      }
      $web3.value = web3;
    }
  });

  // execute extension process automatically if selectedAddress is linked or mobile device
  if (selectedAddress !== null || isMobileDevice) {
    const { extensions } = useExtensions(api, store);
    const { metaExtensions, extensionCount } = useMetaExtensions(api, extensions)!!;
    watchPostEffect(async () => {
      store.commit('general/setMetaExtensions', metaExtensions.value);
      store.commit('general/setExtensionCount', extensionCount.value);
    });
  }
});

export { $api, $web3, $endpoint };

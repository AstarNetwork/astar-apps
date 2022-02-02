import { boot } from 'quasar/wrappers';
import { ApiPromise } from '@polkadot/api';
import { computed, ref, watchPostEffect } from 'vue';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import { connectApi } from 'src/config/api/polkadot/connectApi';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useMeta } from 'quasar';
import { opengraphMeta } from 'src/config/opengraph';
import { useMetaExtensions } from 'src/hooks/useMetaExtensions';
import { useChainInfo } from 'src/hooks/useChainInfo';

const $api = ref<ApiPromise>();

export default boot(async ({ store }) => {
  const { NETWORK_IDX, CUSTOM_ENDPOINT } = LOCAL_STORAGE;

  const networkIdxStore = localStorage.getItem(NETWORK_IDX);
  const customEndpoint = localStorage.getItem(CUSTOM_ENDPOINT);
  if (networkIdxStore) {
    store.commit('general/setCurrentNetworkIdx', parseInt(networkIdxStore));
  }
  if (customEndpoint) {
    store.commit('general/setCurrentCustomEndpoint', customEndpoint);
  }

  const networkIdx = computed(() => store.getters['general/networkIdx']);
  let endpoint = providerEndpoints[networkIdx.value].endpoint;
  if (networkIdx.value === endpointKey.CUSTOM) {
    const customEndpoint = computed(() => store.getters['general/customEndpoint']);
    endpoint = customEndpoint.value;
  }

  // set metadata header
  const favicon = providerEndpoints[parseInt(networkIdx.value)].favicon;
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

  let { api, extensions } = await connectApi(endpoint, networkIdx.value, store);
  $api.value = api;

  // update chaininfo
  const { chainInfo } = useChainInfo(api);
  const { metaExtensions, extensionCount } = useMetaExtensions(api, extensions)!!;
  watchPostEffect(() => {
    store.commit('general/setChainInfo', chainInfo.value);
    store.commit('general/setMetaExtensions', metaExtensions.value);
    store.commit('general/setExtensionCount', extensionCount.value);
  });
});

export { $api };

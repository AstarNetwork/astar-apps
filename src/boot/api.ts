import { boot } from 'quasar/wrappers';
import { ApiPromise } from '@polkadot/api';
import { computed, ref } from 'vue';
import { useStore } from 'src/store';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import { connectApi } from 'src/config/api/polkadot/connectApi';

const $api = ref<ApiPromise>();
const $extensions = ref();

export default boot(async ({ app, router, store }) => {
  // const store = useStore();
  console.log('ss', store);
  const networkIdx = computed(() => store.getters['general/networkIdx']);
  let endpoint = providerEndpoints[networkIdx.value].endpoint;
  if (networkIdx.value === endpointKey.CUSTOM) {
    const customEndpoint = computed(() => store.getters['general/customEndpoint']);
    endpoint = customEndpoint.value;
  }

  let { api, extensions } = await connectApi(endpoint, networkIdx.value, store);
  $api.value = api;
  $extensions.value = extensions;
});

export { $api, $extensions };

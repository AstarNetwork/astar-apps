<template>
  <polkadot-provider :polkadotApi="api" :extensions="extensions">
    <slot />
  </polkadot-provider>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'src/store';
import PolkadotProvider from './PolkadotProvider.vue';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import { connectApi } from 'src/config/api/polkadot';

export default defineComponent({
  name: 'api-loader',
  async setup() {
    const store = useStore();
    const networkIdx = computed(() => store.getters['general/networkIdx']);
    let endpoint = providerEndpoints[networkIdx.value].endpoint;
    if (networkIdx.value === endpointKey.CUSTOM) {
      const customEndpoint = computed(() => store.getters['general/customEndpoint']);
      endpoint = customEndpoint.value;
    }

    let { api, extensions } = await connectApi(endpoint, networkIdx.value);
    // only for sidebar, which is not connected with provider
    // store.commit('general/setApi', api);
    store.commit('general/setExtensions', extensions);

    return {
      api,
      extensions,
    };
  },
  components: {
    PolkadotProvider,
  },
});
</script>

<template>
  <polkadot-provider :polkadot-api="api" :extensions="extensions">
    <slot />
  </polkadot-provider>
</template>

<script lang="ts">
import { defineComponent, computed, watchPostEffect } from 'vue';
import { useStore } from 'src/store';
import PolkadotProvider from './PolkadotProvider.vue';
// import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
// import { connectApi } from 'src/config/api/polkadot/connectApi';
import { useMetaExtensions } from 'src/hooks/useMetaExtensions';
import { useChainInfo } from 'src/hooks/useChainInfo';
import { $api, $extensions } from 'boot/api';

export default defineComponent({
  name: 'ApiLoader',
  components: {
    PolkadotProvider,
  },
  async setup() {
    // console.log('fff', $api);

    const store = useStore();
    // const networkIdx = computed(() => store.getters['general/networkIdx']);
    // let endpoint = providerEndpoints[networkIdx.value].endpoint;
    // if (networkIdx.value === endpointKey.CUSTOM) {
    //   const customEndpoint = computed(() => store.getters['general/customEndpoint']);
    //   endpoint = customEndpoint.value;
    // }

    // let { api, extensions } = await connectApi(endpoint, networkIdx.value);

    const { chainInfo } = useChainInfo($api.value!!);
    const { metaExtensions, extensionCount } = useMetaExtensions($api.value!!, $extensions.value)!!;
    watchPostEffect(() => {
      store.commit('general/setChainInfo', chainInfo.value);
      store.commit('general/setMetaExtensions', metaExtensions.value);
      store.commit('general/setExtensionCount', extensionCount.value);
    });
    const api = $api.value;
    const extensions = $extensions.value;

    return {
      api,
      extensions,
    };
  },
});
</script>

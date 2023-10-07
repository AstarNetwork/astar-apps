<template>
  <div v-if="currentNetworkChain === astarChain.SHIDEN">
    <img src="~assets/img/shiden_logo.png" width="152" height="44" />
  </div>
  <div v-else-if="currentNetworkChain === astarChain.SHIBUYA">
    <img src="~assets/img/shibuya_logo.png" width="152" height="55" />
  </div>
  <div v-else-if="currentNetworkChain === providerEndpoints[endpointKey.AKIBA].displayName">
    <img src="~assets/img/chain/akiba.svg" width="152" height="55" />
  </div>
  <div v-else-if="currentNetworkChain === providerEndpoints[endpointKey.ASTAR_ZKEVM].displayName">
    <img src="~assets/img/astar_logo.png" width="200" height="78" />
  </div>
  <img
    v-else-if="currentNetworkChain === astarChain.ASTAR"
    src="~assets/img/astar_logo.png"
    width="200"
    height="78"
  />
  <div v-else></div>
</template>
<script lang="ts">
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { defineComponent } from 'vue';
import { astarChain } from 'src/config/chain';

export default defineComponent({
  setup() {
    const { currentNetworkChain } = useNetworkInfo();

    return {
      providerEndpoints,
      currentNetworkChain,
      endpointKey,
      astarChain,
    };
  },
});
</script>

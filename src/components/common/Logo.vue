<template>
  <img src="~assets/img/astar_logo.png" width="200" height="78" />
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

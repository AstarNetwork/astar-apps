<template>
  <div v-if="!small">
    <div v-if="currentNetworkIdx === endpointKey.SHIDEN">
      <img src="~assets/img/shiden_logo.png" widht="152" height="44" />
    </div>
    <div v-else-if="currentNetworkIdx === endpointKey.SHIBUYA">
      <img src="~assets/img/shibuya_logo.png" width="152" height="55" />
    </div>
    <img v-else src="~assets/img/astar_logo.png" width="200" height="78" />
  </div>
  <div v-else>
    <img
      v-if="currentNetworkIdx === endpointKey.SHIDEN"
      src="~assets/img/shiden_logo.png"
      alt="sdn"
    />
    <img
      v-if="currentNetworkIdx === endpointKey.ASTAR"
      src="~assets/img/astar_logo.png"
      alt="astr"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import { useStore } from 'src/store';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';

export default defineComponent({
  props: {
    small: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const store = useStore();
    const currentNetworkIdx = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return getProviderIndex(chain);
    });

    return {
      currentNetworkIdx,
      endpointKey,
      ...toRefs(props),
    };
  },
});
</script>

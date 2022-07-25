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
import { endpointKey } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  props: {
    small: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { currentNetworkIdx } = useNetworkInfo();

    return {
      currentNetworkIdx,
      endpointKey,
      ...toRefs(props),
    };
  },
});
</script>

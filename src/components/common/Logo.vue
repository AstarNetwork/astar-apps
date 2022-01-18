<template>
  <div v-if="!small">
    <div v-if="currentNetworkIdx === endpointKey.SHIDEN" class="tw-px-6">
      <img src="~assets/img/shiden.png" />
    </div>
    <div v-else-if="currentNetworkIdx === endpointKey.SHIBUYA" class="tw-px-6">
      <img src="~assets/img/shibuya.svg" />
    </div>
    <img v-else src="~assets/img/astar.png" />
  </div>
  <div v-else>
    <img
      v-if="currentNetworkIdx === endpointKey.SHIDEN"
      src="~assets/img/sdn-token.png"
      alt="sdn"
    />
    <img
      v-if="currentNetworkIdx === endpointKey.ASTAR"
      src="~assets/img/astr-token.png"
      alt="astr"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import { useStore } from 'src/store';
import { endpointKey } from 'src/config/chainEndpoints';

export default defineComponent({
  props: {
    small: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const store = useStore();
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

    return {
      currentNetworkIdx,
      endpointKey,
      ...toRefs(props),
    };
  },
});
</script>

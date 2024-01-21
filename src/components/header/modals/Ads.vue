<template>
  <div class="wrapper--ads">
    <div
      class="card--welcome"
      :class="isShiden ? 'card--welcome-bg-shiden' : 'card--welcome-bg-astar'"
    >
      <div class="row--card-text">
        <span> {{ $t('drawer.welcomeCard.title', { network: currentNetworkName }) }} </span>
      </div>
      <div class="row--card-text">
        <span> {{ $t('drawer.welcomeCard.text') }} </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { endpointKey } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  setup(props) {
    const { currentNetworkName, currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed<boolean>(() => currentNetworkIdx.value === endpointKey.SHIDEN);
    return { currentNetworkName, isShiden };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/ads.scss';
</style>

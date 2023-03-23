<template>
  <div class="wrapper--card">
    <div class="wrapper--img" :style="`background-image: url('${bg_img.wasm_hero}')`"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import { endpointKey } from 'src/config/chainEndpoints';
import adsData from 'src/data/ads.json';

export default defineComponent({
  setup() {
    const bg_img = {
      wasm_hero: require('/src/assets/img/wasm_banner.svg'),
    };
    const { currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);

    const items = adsData;

    const goToLink = (link: string) => {
      window.open(link, '_blank');
    };

    return {
      items,
      bg_img,
      isShiden,
      goToLink,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper--card {
  //Desktop; height 280px (max), gets proportionally smaller (resizing to fit) - please have 6px radius.
  //Mobile (no sidebar) ; height 200px (min), keep it centre and cut the side.
  width: 100%;
  height: 200px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  margin-bottom: 24px;
  @media (min-width: $md) {
    height: 280px;
    margin-bottom: 0px;
  }
  overflow-y: hidden;
  &::-webkit-scrollbar {
    display: none;
  }
}
.wrapper--img {
  width: 100%;
  height: 100%;
}
</style>

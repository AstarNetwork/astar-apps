<template>
  <div class="wrapper--card">
    <div
      class="wrapper--img"
      :style="`background-image: url('${bg_img.wasm_hero}')`"
      @click="goToLink()"
    ></div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const bg_img = {
      wasm_hero: require('/src/assets/img/wasm_banner.svg'),
    };

    const goToLink = () => {
      // @TODO: update link
      window.open('https://docs.astar.network/docs/dapp-staking/', '_blank');
    };

    return {
      bg_img,
      goToLink,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper--card {
  width: 100%;
  height: 200px;
  border-radius: 6px;
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
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
}
</style>

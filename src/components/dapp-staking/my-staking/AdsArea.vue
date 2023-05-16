<template>
  <div class="wrapper--cards">
    <div v-for="(t, index) in items" :key="index" class="card" @click="goToLink(t.link)">
      <div
        class="wrapper--img"
        :style="`background-image: url('${isShiden ? bg_img.shiden_hero : bg_img.astar_hero}')`"
      ></div>
      <div class="txt--subtitle">{{ t.subtitle }}</div>
      <div class="txt--title">{{ t.title }}</div>
    </div>
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
      astar_hero: require('/src/assets/img/banner/banner-02-astar.png'),
      shiden_hero: require('/src/assets/img/banner/banner-02-shiden.png'),
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
.wrapper--cards {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 16px;
  justify-content: center;
  padding: 0 16px;
  margin-top: 48px;
  margin-bottom: 48px;
  @media (min-width: $md) {
    justify-content: center;
    gap: 24px;
  }
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  justify-content: left;
  &::-webkit-scrollbar {
    display: none;
  }
}
.card {
  flex-basis: 30%;
  cursor: pointer;

  margin-bottom: 48px;
  @media (min-width: $md) {
    flex-basis: 0;
  }
  .wrapper--img {
    background: rgb(110, 110, 110);
    background-size: cover;
    height: 200px;
    border-radius: 6px;
    width: 300px;
    @media (min-width: $md) {
      width: 100%;
    }
    @media (min-width: $xl) {
      width: 310px;
    }
  }
  .txt--subtitle {
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    color: #b1b7c1;
    margin-top: 16px;
  }
  .txt--title {
    font-weight: 600;
    font-size: 20px;
    line-height: 18px;
    color: $navy-1;
    margin-top: 10px;
  }
  @media (max-width: $sm) {
    margin-bottom: 40px;
  }
}
.body--dark {
  .card {
    .txt--title {
      color: $gray-1;
    }
  }
}
</style>

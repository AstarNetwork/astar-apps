<template>
  <div class="wrapper--ads-area">
    <swiper
      class="swiper--ads-area"
      :slides-per-view="1.25"
      :slides-per-group="1"
      :space-between="24"
      :navigation="true"
      :modules="modules"
      :breakpoints="{
        '768': {
          slidesPerView: 3,
          slidesPerGroup: 3,
        },
      }"
    >
      <swiper-slide v-for="(t, index) in items" :key="index">
        <div class="card--swiper" @click="goToLink(t.link)">
          <img :src="t.img" class="card__img" />
          <div class="card__bottom">
            <div>
              <div class="text--subtitle">{{ t.subtitle }}</div>
              <div class="text--title">{{ t.title }}</div>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import { endpointKey } from 'src/config/chainEndpoints';
import adsData from 'src/data/ads.json';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

export default defineComponent({
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const bg_img = {
      astar_hero: require('/src/assets/img/banner/banner-02-astar.png'),
      shiden_hero: require('/src/assets/img/banner/banner-02-shiden.png'),
    };
    const { currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);

    const items = adsData.map((item) => {
      return {
        ...item,
        img: item.img === '' ? bg_img.astar_hero : item.img,
      };
    });

    const goToLink = (link: string) => {
      window.open(link, '_blank');
    };

    return {
      modules: [Navigation],
      items,
      goToLink,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/ads-area.scss';
</style>

<template>
  <div class="wrapper--leaderboard">
    <div class="title">{{ $t('stakingV3.tierLeaderboard') }}</div>

    <div class="container--boards">
      <swiper
        class="swiper--ads-area"
        :slides-per-view="1.25"
        :slides-per-group="1"
        :space-between="8"
        :navigation="true"
        :modules="modules"
        :breakpoints="{
          '768': {
            slidesPerView: 2.5,
            slidesPerGroup: 2,
            spaceBetween: 8,
          },
          '1024': {
            slidesPerView: 2.5,
            slidesPerGroup: 2,
            spaceBetween: 8,
          },
          '1280': {
            slidesPerView: 3.5,
            slidesPerGroup: 3,
            spaceBetween: 8,
          },
        }"
      >
        <swiper-slide v-for="[tier, dapps] in leaderBoards" :key="tier">
          <tier :tier="tier" :dapps="dapps" />
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useLeaderboard } from 'src/staking-v3/hooks';
import Tier from './Tier.vue';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

export default defineComponent({
  components: {
    Tier,
    Swiper,
    SwiperSlide,
  },
  setup() {
    const { leaderBoards } = useLeaderboard();

    return { modules: [Navigation], leaderBoards };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/leaderboard.scss';
</style>

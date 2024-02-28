<template>
  <div v-if="!isLeaderboardEmpty" class="wrapper--leaderboard">
    <div class="wrapper--leaderboard__inner">
      <div class="title">{{ $t('stakingV3.tierLeaderboard') }}</div>

      <div class="container--boards">
        <swiper
          class="swiper--leaderboard"
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
            <tier :tier="tier" :dapps="dapps" :daily-reward="getDailyReward(tier)" />
          </swiper-slide>
        </swiper>
      </div>
    </div>
    <div class="bg--leaderboard">
      <img :src="require('/src/staking-v3/assets/leaderboard_bg.webp')" alt="" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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
    const { leaderBoards, isLeaderboardEmpty, getDailyReward } = useLeaderboard();

    return { leaderBoards, isLeaderboardEmpty, getDailyReward, modules: [Navigation] };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/leaderboard.scss';
</style>

<style lang="scss">
.swiper--leaderboard {
  > .swiper-button-prev,
  > .swiper-button-next {
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: $navy-1;
    &::after {
      font-size: 12px;
      font-weight: 600;
    }
  }
  > .swiper-button-prev {
    padding-right: 2px;
  }
  > .swiper-button-next {
    padding-left: 2px;
  }
  > .swiper-button-disabled {
    display: none;
  }
}
</style>

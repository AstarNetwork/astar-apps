<template>
  <div class="wrapper--leaderboard">
    <div class="wrapper--leaderboard__inner">
      <div class="title">{{ $t('stakingV3.projectLeaderboards') }}</div>
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
          <swiper-slide>
            <leaderboard-vote-panel
              :title="$t('stakingV3.stakes')"
              :paginated-dapps="paginatedStakeRankingVoting"
              :contains-balance="true"
            />
          </swiper-slide>
          <swiper-slide>
            <leaderboard-vote-panel
              :title="$t('stakingV3.transactions')"
              :paginated-dapps="paginatedTransactionsRanking"
              :contains-balance="false"
            />
          </swiper-slide>
          <swiper-slide>
            <leaderboard-vote-panel
              :title="$t('stakingV3.users')"
              :paginated-dapps="paginatedUsersRanking"
              :contains-balance="false"
            />
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
import { useLeaderboard, useDapps } from '../../hooks';
import LeaderboardVotePanel from './LeaderboardVotePanel.vue';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

export default defineComponent({
  components: {
    Swiper,
    SwiperSlide,
    LeaderboardVotePanel,
  },
  setup() {
    const {
      isLeaderboardEmpty,
      paginatedStakeRankingVoting,
      paginatedTransactionsRanking,
      paginatedUsersRanking,
      dappsPerPage,
    } = useLeaderboard();

    return {
      modules: [Navigation],
      isLeaderboardEmpty,
      paginatedStakeRankingVoting,
      paginatedTransactionsRanking,
      paginatedUsersRanking,
      dappsPerPage,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/leaderboard.scss';
@import './styles/tier.scss';
</style>

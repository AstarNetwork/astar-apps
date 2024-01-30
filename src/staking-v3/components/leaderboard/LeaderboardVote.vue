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
              title="Stake Ranking"
              :paginated-dapps="paginatedStakeRanking"
              :contains-balance="true"
            />
          </swiper-slide>
          <swiper-slide>
            <leaderboard-vote-panel
              title="Stake Ranking"
              :paginated-dapps="paginatedStakeRanking"
              :contains-balance="true"
            />
          </swiper-slide>
          <swiper-slide>
            <leaderboard-vote-panel
              title="Stake Ranking"
              :paginated-dapps="paginatedStakeRanking"
              :contains-balance="true"
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
import { defineComponent, computed, onMounted, ref, watch } from 'vue';
import { useLeaderboard, useDapps } from '../../hooks';
import LeaderboardVotePanel, { LeaderboardPanelData } from './LeaderboardVotePanel.vue';
import { useDappStakingNavigation } from '../../hooks';

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
    const { sortedDapps, isLeaderboardEmpty } = useLeaderboard();
    const { navigateDappPage } = useDappStakingNavigation();
    const { fetchDappStats, dappsStats } = useDapps();

    const dappsPerPage = 5;
    const paginatedStakeRanking = computed<LeaderboardPanelData[][]>(() => {
      const result: LeaderboardPanelData[][] = [];
      for (let i = 0; i < sortedDapps.value.length; i += dappsPerPage) {
        result.push(
          sortedDapps.value.slice(i, i + dappsPerPage).map((dapp, index) => ({
            rank: index + 1 + i * dappsPerPage,
            address: dapp.basic.address,
            name: dapp.basic.name,
            iconUrl: dapp.basic.iconUrl,
            value: dapp.chain.totalStake ?? BigInt(0),
          }))
        );
      }
      return result;
    });

    const paginatedTransactionsRanking = ref<LeaderboardPanelData[][]>([]);

    onMounted(() => {
      fetchDappStats();
    });

    watch([dappsStats], () => {
      console.log(dappsStats.value);
    });

    return {
      modules: [Navigation],
      isLeaderboardEmpty,
      paginatedStakeRanking,
      dappsPerPage,
      navigateDappPage,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/leaderboard.scss';
@import './styles/tier.scss';
</style>

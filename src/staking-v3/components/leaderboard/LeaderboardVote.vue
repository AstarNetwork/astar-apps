<template>
  <div v-if="isLeaderboardEmpty" class="wrapper--leaderboard">
    <div class="wrapper--leaderboard__inner">
      <div class="title">{{ $t('stakingV3.projectLeaderboards') }}</div>

      <div class="container--boards">
        <div class="wrapper--tier">
          <swiper
            v-if="paginatedDapps.length > 0"
            class="swiper--tier"
            :navigation="true"
            :modules="modules"
          >
            <swiper-slide v-for="(dapps, page) in paginatedDapps" :key="page">
              <div class="container--dapps">
                <div v-for="(dapp, index) in dapps" :key="dapp.chain.id">
                  <div class="dapp">
                    <div>{{ index + 1 + page * dappsPerPage }}</div>
                    <div class="dapp--button" @click="navigateDappPage(dapp.basic.address)">
                      <div class="dapp--image">
                        <img :src="dapp.basic.iconUrl" :alt="dapp.basic.name" />
                      </div>
                      <div>{{ dapp.basic.name }}</div>
                    </div>
                    <div class="amount">
                      <token-balance-native :balance="dapp.chain.totalStake?.toString() ?? '0'" />
                    </div>
                  </div>
                </div>
              </div>
            </swiper-slide>
          </swiper>
        </div>
      </div>
    </div>
    <div class="bg--leaderboard">
      <img :src="require('/src/staking-v3/assets/leaderboard_bg.webp')" alt="" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useLeaderboard } from '../../hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { useDappStakingNavigation } from '../../hooks';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

export default defineComponent({
  components: {
    TokenBalanceNative,
    Swiper,
    SwiperSlide,
  },
  setup() {
    const { sortedDapps, isLeaderboardEmpty } = useLeaderboard();

    const { navigateDappPage } = useDappStakingNavigation();

    const dappsPerPage = 5;
    const paginatedDapps = computed(() => {
      const result = [];
      for (let i = 0; i < sortedDapps.value.length; i += dappsPerPage) {
        result.push(sortedDapps.value.slice(i, i + dappsPerPage));
      }
      return result;
    });

    return {
      modules: [Navigation],
      isLeaderboardEmpty,
      paginatedDapps,
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

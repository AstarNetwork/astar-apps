<template>
  <div class="wrapper--tier">
    <swiper
      v-if="paginatedDapps.length > 0"
      class="swiper--tier"
      :navigation="true"
      :modules="modules"
    >
      {{ title }}
      <swiper-slide v-for="(dapps, page) in paginatedDapps" :key="page">
        <div class="container--dapps">
          <div v-for="(dapp, index) in dapps" :key="dapp.address">
            <div class="dapp">
              <div>{{ index + 1 + page * dappsPerPage }}</div>
              <div class="dapp--button" @click="navigateDappPage(dapp.address)">
                <div class="dapp--image">
                  <img :src="dapp.iconUrl" :alt="dapp.name" />
                </div>
                <div>{{ dapp.name }}</div>
              </div>
              <div class="amount">
                <token-balance-native :balance="dapp.value.toString()" />
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { LeaderboardData } from 'src/staking-v3/hooks';

export default defineComponent({
  components: {
    TokenBalanceNative,
    Swiper,
    SwiperSlide,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    paginatedDapps: {
      type: Array as PropType<LeaderboardData[][]>,
      required: true,
    },
    containsBalance: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const dappsPerPage = 5;

    return { modules: [Navigation], dappsPerPage };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/leaderboard.scss';
@import './styles/tier.scss';
</style>

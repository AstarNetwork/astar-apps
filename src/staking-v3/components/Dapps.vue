<template>
  <div v-if="filteredDapps.length > 0" class="wrapper--dapps">
    <div class="title--category">{{ category }}</div>
    <div class="container--dapps">
      <swiper
        class="swiper--dapps"
        :slides-per-view="1.5"
        :slides-per-group="1"
        :space-between="8"
        :breakpoints="{
          '640': {
            slidesPerView: 2.5,
            slidesPerGroup: 2,
          },
          '1440': {
            slidesPerView: 3.5,
            slidesPerGroup: 3,
          },
        }"
      >
        <swiper-slide v-for="(dapp, index) in filteredDapps" :key="index">
          <a v-if="dapp" class="card--dapp" :href="getDappPageUrl(dapp.basic.address)">
            <div class="card__top">
              <div class="icon--dapp">
                <img :src="dapp.basic.iconUrl" alt="icon" />
              </div>
              <div class="text--dapp">
                <div class="text--title">{{ dapp.basic.name }}</div>
                <div class="text--description">{{ dapp.basic.shortDescription }}</div>
              </div>
            </div>
            <div class="card__bottom">
              <div>T{{ getDappTier(dapp.chain.id) ?? '-' }}</div>
              <div>{{ dapp.dappDetails?.stakersCount ?? '--' }}</div>
              <div>
                <token-balance-native :balance="dapp.chain.totalStake?.toString() ?? '0'" />
              </div>
            </div>
          </a>
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useDappStaking, useDappStakingNavigation, useDapps } from '../hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { CombinedDappInfo } from '../logic';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

export default defineComponent({
  components: {
    TokenBalanceNative,
    Swiper,
    SwiperSlide,
  },
  props: {
    search: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { registeredDapps } = useDapps();
    const { getDappTier } = useDappStaking();
    const { getDappPageUrl } = useDappStakingNavigation();

    const filteredDapps = computed<CombinedDappInfo[]>(() => {
      const dapps = registeredDapps.value.filter(
        (x) =>
          x.basic.mainCategory?.toLowerCase() === props.category.toLowerCase() ||
          (x.basic.mainCategory === undefined && props.category.toLowerCase() === 'others')
      );

      const value = props.search.toLowerCase();
      const result = dapps.filter(
        (dapp) =>
          dapp.basic.name.toLowerCase().includes(value) ||
          dapp.basic.shortDescription.toLowerCase().includes(value)
      );
      return result;
    });

    return { filteredDapps, getDappTier, getDappPageUrl };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapps.scss';
</style>

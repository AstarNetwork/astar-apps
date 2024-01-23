<template>
  <div v-if="filteredDapps.length > 0" class="wrapper--dapps">
    <div
      class="container--category"
      :style="{ backgroundImage: `url(${categoryBackgroundImages[category]})` }"
    >
      <div class="title--category">{{ categoryTitle }}</div>
    </div>
    <div class="container--dapps">
      <swiper
        class="swiper--dapps"
        :slides-per-view="1.5"
        :slides-per-group="1"
        :space-between="8"
        :grid="{
          rows: 2,
        }"
        :breakpoints="{
          '768': {
            slidesPerView: 2.5,
            slidesPerGroup: 2,
            grid: {
              rows: 2,
            },
          },
          '1440': {
            slidesPerView: 3.5,
            slidesPerGroup: 3,
            grid: {
              rows: 2,
            },
          },
        }"
        :modules="modules"
      >
        <swiper-slide v-for="(dapp, index) in filteredDapps" :key="index">
          <router-link v-if="dapp" class="card--dapp" :to="getDappPageUrl(dapp.basic.address)">
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
          </router-link>
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
import { possibleCategories } from 'src/components/dapp-staking/register/components/MainCategory.vue';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/grid';
import { Grid } from 'swiper/modules';

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

    const categoryTitle = computed<string>(() => {
      const category = possibleCategories.find(
        (x: { label: string; value: string }) =>
          x.value.toLowerCase() === props.category.toLowerCase()
      );
      return category?.label ?? '';
    });

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
          dapp.basic.shortDescription?.toLowerCase().includes(value)
      );
      return result;
    });

    const categoryBackgroundImages = {
      defi: require('/src/staking-v3/assets/category_pink.webp'),
      nft: require('/src/staking-v3/assets/category_purple.webp'),
      tooling: require('/src/staking-v3/assets/category_blue.webp'),
      utility: require('/src/staking-v3/assets/category_sky.webp'),
      others: require('/src/staking-v3/assets/category_green.webp'),
    };

    return {
      modules: [Grid],
      filteredDapps,
      categoryBackgroundImages,
      categoryTitle,
      getDappTier,
      getDappPageUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapps.scss';
</style>

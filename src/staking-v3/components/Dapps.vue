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
        :navigation="true"
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
              <div class="box--dapp-card">T{{ getDappTier(dapp.chain.id) ?? '-' }}</div>
              <div class="box--dapp-card">
                <span>
                  <astar-icon-base class="icon--stakers">
                    <astar-icon-community />
                  </astar-icon-base>
                  {{ dapp.dappDetails?.stakersCount ?? '--' }}
                </span>
                <span>
                  <logo :flat="true" :symbol="true" class="icon--astar-logo" />
                  <format-balance :balance="dapp.chain.totalStake?.toString() ?? '0'" />
                </span>
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
import { CombinedDappInfo } from '../logic';
import { possibleCategories } from 'src/components/dapp-staking/register/components/MainCategory.vue';
import FormatBalance from 'src/components/common/FormatBalance.vue';
import Logo from 'src/components/common/Logo.vue';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';
import { Grid, Navigation } from 'swiper/modules';

export default defineComponent({
  components: {
    Swiper,
    SwiperSlide,
    FormatBalance,
    Logo,
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
      'unstoppable-grants': require('/src/staking-v3/assets/category_unstoppable.webp'),
    };

    return {
      modules: [Grid, Navigation],
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

<style lang="scss">
.swiper--dapps {
  .swiper-button-prev,
  .swiper-button-next {
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
  .swiper-button-prev {
    padding-right: 2px;
  }
  .swiper-button-next {
    padding-left: 2px;
  }
  .swiper-button-disabled {
    display: none;
  }
}
</style>

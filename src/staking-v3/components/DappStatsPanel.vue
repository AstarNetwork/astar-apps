<template>
  <div class="panel-wrapper">
    <div class="panel-title">{{ title }}</div>
    <q-skeleton v-if="!pages.length" class="skeleton-dapp-stats" />
    <div v-else class="wrapper--stats">
      <swiper class="swiper--stats" :navigation="true" :modules="modules">
        <swiper-slide v-for="(dapps, page) in pages" :key="page">
          <div class="container-dapps">
            <div v-for="(dapp, index) in dapps" :key="index">
              <div class="dapp">
                <div>{{ index + 1 + page * itemsPerPage }}</div>
                <div class="dapp-button" @click="navigateDappPage(dapp.address)">
                  <div class="dapp-icon"><img :src="dapp.iconUrl" :alt="dapp.name" /></div>
                  <div class="dapp-name">{{ dapp.name }}</div>
                </div>
                <token-balance-native
                  :balance="dapp.amount.toString() ?? '0'"
                  :decimals="0"
                  :show-token-symbol="false"
                />
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { useDappStakingNavigation } from '../hooks';

export type PanelData = {
  name: string;
  iconUrl: string;
  amount: bigint;
  address: string;
};

export default defineComponent({
  components: {
    Swiper,
    SwiperSlide,
    TokenBalanceNative,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    data: {
      type: Array as PropType<PanelData[]>,
      required: true,
    },
  },
  setup(props) {
    const itemsPerPage = 5;
    const { navigateDappPage } = useDappStakingNavigation();

    const pages = computed<PanelData[][]>(() => {
      const pages = [];
      for (let i = 0; i < props.data.length; i += itemsPerPage) {
        pages.push(props.data.slice(i, i + itemsPerPage));
      }
      return pages;
    });

    return { modules: [Navigation], itemsPerPage, pages, navigateDappPage };
  },
});
</script>

<style scoped lang="scss">
@import './styles/dapp-stats-panel.scss';
</style>

<style lang="scss">
.swiper--stats {
  > .swiper-button-prev,
  > .swiper-button-next {
    margin: 0;
    margin-right: 6px;
    position: relative;
    width: 24px;
    height: 24px;
    display: block;
    text-align: center;
    left: 0;
    right: 0;

    &::after {
      font-size: 14px;
      font-weight: 600;
      line-height: 24px;
    }
  }
}
</style>

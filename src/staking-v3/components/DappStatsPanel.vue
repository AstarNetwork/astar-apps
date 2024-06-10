<template>
  <div class="panel-wrapper">
    <div class="panel-title">{{ title }}</div>
    <div class="wrapper--stats">
      <swiper class="swiper--stats" :navigation="true" :modules="modules">
        <swiper-slide v-for="(dapps, page) in pages" :key="page">
          <div class="container-dapps">
            <div v-for="(dapp, index) in dapps" :key="index">
              <div class="dapp">
                <div>{{ index + 1 + page * itemsPerPage }}</div>
                <!-- TODO: add link to dapp page -->
                <div class="dapp-button">
                  <div class="dapp-icon"><img :src="dapp.iconUrl" :alt="dapp.name" /></div>
                  <div class="dapp-name">{{ dapp.name }}</div>
                </div>
                <token-balance-native :balance="dapp.amount.toString() ?? '0'" />
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

export type PanelData = {
  name: string;
  iconUrl: string;
  amount: bigint;
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

    const pages = computed<PanelData[][]>(() => {
      const pages = [];
      for (let i = 0; i < props.data.length; i += itemsPerPage) {
        pages.push(props.data.slice(i, i + itemsPerPage));
      }
      return pages;
    });

    return { modules: [Navigation], itemsPerPage, pages };
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

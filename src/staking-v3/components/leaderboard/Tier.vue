<template>
  <div class="wrapper--tier">
    <div class="row--tier-header">
      <div class="text--title">{{ $t('stakingV3.tier') }} {{ tier }}</div>
      <div class="column--reward">
        <div class="text--reward">{{ $t('stakingV3.rewardPerDay') }}</div>
        <div class="text--amount">
          <token-balance-native :balance="dailyReward?.toString() ?? '0'" />
        </div>
      </div>
    </div>

    <swiper class="swiper--tier" :navigation="true" :modules="modules">
      <swiper-slide>
        <div class="container--dapps">
          <div v-for="(dapp, index) in page1" :key="dapp.chain.id">
            <dapp-item :index="index" :dapp="dapp" />
          </div>
          <div v-for="index in itemsPerPage - page1.length" :key="index">
            <no-entry :index="index" :length="page1.length" />
          </div>
        </div>
      </swiper-slide>

      <swiper-slide>
        <div class="container--dapps">
          <div v-for="(dapp, index) in page2" :key="dapp.chain.id">
            <dapp-item :index="index + itemsPerPage" :dapp="dapp" />
          </div>
          <div v-for="index in itemsPerPage - page2.length" :key="index">
            <no-entry :index="index + itemsPerPage" :length="page2.length" />
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { CombinedDappInfo } from '../../logic';
import { useDappStakingNavigation } from '../../hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import DappItem from './DappItem.vue';
import noEntry from './noEntry.vue';

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
    DappItem,
    noEntry,
  },
  props: {
    tier: {
      type: Number,
      required: true,
    },
    dapps: {
      type: Object as PropType<CombinedDappInfo[]>,
      required: true,
    },
    dailyReward: {
      type: BigInt as unknown as PropType<bigint>,
      required: true,
    },
  },
  setup(props) {
    const itemsToShow = 10;
    const itemsPerPage = 5;
    const slicedDapps = computed<CombinedDappInfo[]>(() => props.dapps.slice(0, itemsToShow));

    const page1 = computed<CombinedDappInfo[]>(() => props.dapps.slice(0, itemsPerPage));
    const page2 = computed<CombinedDappInfo[]>(() => props.dapps.slice(itemsPerPage, itemsToShow));

    const { navigateDappPage } = useDappStakingNavigation();

    return {
      modules: [Navigation],
      slicedDapps,
      itemsPerPage,
      page1,
      page2,
      navigateDappPage,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/tier.scss';
</style>

<style lang="scss">
.swiper--tier {
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

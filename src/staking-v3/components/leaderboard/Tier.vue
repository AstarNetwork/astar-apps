<template>
  <div class="wrapper--tier">
    <div class="row--tier-header">
      <div class="text--title">{{ $t('stakingV3.tier') }} {{ tier }}</div>
      <div class="rewards">
        <div class="column--reward">
          <div class="text--reward">{{ $t('stakingV3.rewardPerDay') }}</div>
          <div class="text--amount">
            <token-balance-native :balance="dailyReward?.toString() ?? '0'" :decimals="0" />
          </div>
        </div>
        <div class="column--reward">
          <div class="text--reward">{{ $t('stakingV3.threshold') }}</div>
          <div class="text--amount">
            <token-balance-native
              :balance="tiersConfiguration?.tierThresholds[tier - 1]?.toString() ?? '0'"
              :decimals="0"
            />
          </div>
        </div>
      </div>
    </div>

    <swiper class="swiper--tier" :navigation="true" :modules="modules">
      <swiper-slide v-for="(page, pageIndex) in pages" :key="`page-${pageIndex}`">
        <div class="container--dapps">
          <div v-for="(dapp, index) in page" :key="`page-${index}`">
            <dapp-item
              v-if="dapp !== null"
              :index="pageIndex * itemsPerPage + index"
              :dapp="dapp"
            />
            <no-entry v-else :index="pageIndex * itemsPerPage + index" />
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { CombinedDappInfo } from '../../logic';
import { useDappStakingNavigation, useDappStaking } from '../../hooks';
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
    const itemsPerPage = 5;
    const { tiersConfiguration } = useDappStaking();

    const slotsPerTier = computed<number>(() => {
      return tiersConfiguration.value.slotsPerTier[props.tier - 1];
    });

    // Fill in dapps array with nulls so total array length matches number of available slots.
    const dappsFull = computed<(CombinedDappInfo | null)[]>(() => {
      const result: (CombinedDappInfo | null)[] = [];
      for (let i = 0; i < slotsPerTier.value; i++) {
        result.push(i < props.dapps.length ? props.dapps[i] : null);
      }
      return result;
    });

    const pages = computed<(CombinedDappInfo | null)[][]>(() => {
      const pages = [];
      for (let i = 0; i < dappsFull.value.length; i += itemsPerPage) {
        pages.push(dappsFull.value.slice(i, i + itemsPerPage));
      }
      return pages;
    });

    const { navigateDappPage } = useDappStakingNavigation();

    return {
      modules: [Navigation],
      itemsPerPage,
      pages,
      tiersConfiguration,
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

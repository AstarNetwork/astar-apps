<template>
  <div class="wrapper--tier">
    <div class="row--tier-header">
      <div class="text--title">{{ $t('stakingV3.tier') }} {{ tier }}</div>
      <div class="column--reward">
        <div class="text--reward">{{ $t('stakingV3.rewardPerDay') }}</div>
        <div class="text--amount">-- ASTR</div>
      </div>
    </div>

    <swiper class="swiper--tier" :navigation="true" :modules="modules">
      <swiper-slide>
        <div class="container--dapps">
          <div v-for="(dapp, index) in slicedDapps" :key="dapp.chain.id">
            <div class="dapp">
              <div>{{ index + 1 }}</div>
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
          <div v-for="index in itemsToShow - slicedDapps.length" :key="index">
            <div class="dapp">
              <div>{{ index + slicedDapps.length }}</div>
              <div class="dapp--button">
                <div class="dapp--image">
                  <img :src="require('../../assets/burn.png')" alt="Burn" />
                </div>
                <div>No Entry</div>
              </div>
              <div class="amount">Burn</div>
            </div>
          </div>
        </div>
      </swiper-slide>

      <swiper-slide>slide 2</swiper-slide>

      <swiper-slide>slide 3</swiper-slide>
    </swiper>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { CombinedDappInfo } from '../../logic';
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
  props: {
    tier: {
      type: Number,
      required: true,
    },
    dapps: {
      type: Object as PropType<CombinedDappInfo[]>,
      required: true,
    },
  },
  setup(props) {
    const itemsToShow = 5;
    const slicedDapps = computed<CombinedDappInfo[]>(() => props.dapps.slice(0, itemsToShow));

    const { navigateDappPage } = useDappStakingNavigation();

    return {
      modules: [Navigation],
      slicedDapps,
      itemsToShow,
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

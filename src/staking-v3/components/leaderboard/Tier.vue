<template>
  <div class="wrapper--tier">
    <div class="row--tier-header">
      <div class="title">{{ $t('stakingV3.tier') }} {{ tier }}</div>
      <div class="column--reward">
        <div class="text--reward">Reward per day</div>
        <div class="text--amount">-- ASTR</div>
      </div>
    </div>
    <div class="container--dapps">
      <div v-for="(dapp, index) in slicedDapps" :key="dapp.chain.id">
        <div class="dapp">
          <div>{{ index + 1 }}</div>
          <div class="dapp--button" @click="navigateDappPage(dapp.basic.address)">
            <div class="dapp--image"><img :src="dapp.basic.iconUrl" :alt="dapp.basic.name" /></div>
            <div class="name">{{ dapp.basic.name }}</div>
          </div>
          <div class="amount">
            <token-balance-native :balance="dapp.chain.totalStake?.toString() ?? '0'" />
          </div>
        </div>
      </div>
      <div v-for="index in itemsToShow - slicedDapps.length" :key="index">
        <div class="dapp">
          <div>{{ index + slicedDapps.length }}</div>
          <div class="dapp--button__no-entry">
            <div class="dapp--image">
              <img :src="require('../../assets/burn.png')" alt="Burn" />
            </div>
            <div class="name">No Entry</div>
          </div>
          <div class="amount">Burn</div>
        </div>
      </div>
    </div>
    <div class="row--pagination">
      <span class="btn--icon"><astar-icon-arrow-left /></span>
      <span class="btn--icon"><astar-icon-arrow-right /></span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { CombinedDappInfo } from '../../logic';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { useDappStakingNavigation } from '../../hooks';

export default defineComponent({
  components: {
    TokenBalanceNative,
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

    return { slicedDapps, itemsToShow, navigateDappPage };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/tier.scss';
</style>

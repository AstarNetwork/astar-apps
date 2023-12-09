<template>
  <div class="wrapper--tier">
    <div class="title">{{ $t('stakingV3.tier') }} {{ tier }}</div>
    <div class="container--dapps">
      <div v-for="(dapp, index) in slicedDapps" :key="dapp.chain.id">
        <div class="dapp">
          <div>{{ index + 1 }}</div>
          <div class="dapp--image"><img :src="dapp.basic.iconUrl" :alt="dapp.basic.name" /></div>
          <div class="name">{{ dapp.basic.name }}</div>
          <div class="amount">
            <token-balance-native :balance="dapp.chain.totalStake?.toString() ?? '0'" />
          </div>
        </div>
      </div>
      <div v-for="index in itemsToShow - slicedDapps.length" :key="index">
        <div class="dapp">
          <div>{{ index + slicedDapps.length }}</div>
          <div class="dapp--image"><img :src="require('../../assets/burn.png')" alt="Burn" /></div>
          <div class="name">No Entry</div>
          <div class="amount">Burn</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { CombinedDappInfo } from '../../logic';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

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

    return { slicedDapps, itemsToShow };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/tier.scss';
</style>

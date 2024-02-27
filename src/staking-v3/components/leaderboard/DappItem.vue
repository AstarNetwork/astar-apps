<template>
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
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { CombinedDappInfo } from '../../logic';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { useDappStakingNavigation } from '../../hooks';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  props: {
    index: {
      type: Number,
      required: true,
    },
    dapp: {
      type: Object as PropType<CombinedDappInfo>,
      required: true,
    },
  },
  setup(props) {
    const { navigateDappPage } = useDappStakingNavigation();

    return {
      navigateDappPage,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/tier.scss';
</style>

<template>
  <div class="dapp">
    <div>{{ index + length }}</div>
    <div class="dapp--button">
      <div class="dapp--image">
        <img :src="require('../../assets/burn.png')" :alt="$t('stakingV3.burn')" />
      </div>
      <div>{{ $t('stakingV3.noEntry') }}</div>
    </div>
    <div class="amount">
      <token-balance-native :balance="toBeBurned.toString() ?? '0'" />
      {{ $t('stakingV3.burn') }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  props: {
    index: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
    dailyreward: {
      type: BigInt as unknown as PropType<bigint>,
      required: true,
    },
    slots: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const oneE18 = BigInt('1000000000000000000'); // Equivalent to 10^18
    const toBeBurned = (props.dailyreward / BigInt(props.slots) / oneE18) * oneE18;

    return {
      toBeBurned,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/tier.scss';
</style>

<template>
  <div v-if="hasRewards" class="note">
    <b>{{ $t('stakingV3.rewardsWillBeClaimed') }}</b>
    <div class="note--row">
      <div>{{ $t('stakingV3.basicRewards') }}</div>
      <div><token-balance-native :balance="rewards?.staker.toString() ?? ''" /></div>
    </div>
    <div class="note--row">
      <div>{{ $t('stakingV3.bonusRewards') }}</div>
      <div><token-balance-native :balance="rewards?.bonus.toString() ?? ''" /></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDappStaking } from '../hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  setup() {
    const { hasRewards, rewards } = useDappStaking();

    return { rewards, hasRewards };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/vote.scss';
</style>

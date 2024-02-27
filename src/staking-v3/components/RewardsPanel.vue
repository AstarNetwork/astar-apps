<template>
  <div v-if="hasRewards" class="rewards">
    <div class="rewards--row title--rewards">{{ $t('stakingV3.rewardsWillBeClaimed') }}</div>
    <div class="rewards--row">
      <div class="text--rewards">{{ $t('stakingV3.basicRewards') }}</div>
      <div><token-balance-native :balance="rewards?.staker.amount.toString() ?? ''" /></div>
    </div>
    <div class="rewards--row">
      <div class="text--rewards">{{ $t('stakingV3.bonusRewards') }}</div>
      <div><token-balance-native :balance="rewards?.bonus.toString() ?? ''" /></div>
    </div>
    <img
      class="bg--rewards"
      :src="require('/src/staking-v3/assets/unclaimed_rewards_bg.webp')"
      alt=""
    />
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

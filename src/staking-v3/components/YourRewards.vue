<template>
  <div class="wrapper--your-rewards">
    <div class="row--title">
      <span> {{ $t('stakingV3.yourRewards') }} </span>
    </div>

    <div v-if="rewardsPerPeriod.length > 0" class="container--rewards">
      <div class="rows--rewards">
        <div v-for="reward in rewardsPerPeriod" :key="reward.period" class="box--rewards">
          <div>
            <span class="text--title">
              {{ $t('stakingV3.period', { period: formatPeriod(reward.period) }) }}
            </span>
          </div>
          <div class="row--claim-info">
            <div class="column column--label">
              {{ $t('stakingV3.availableToClaim') }}
            </div>
            <div class="column column--days">
              {{ $t('stakingV3.days', { day: reward.erasToReward }) }}
            </div>
            <div class="column column--amount">
              <token-balance-native :balance="reward.rewards.toString()" />
            </div>
          </div>
          <div
            v-if="rewardExpiresInNextPeriod(reward.period) && reward.rewards > BigInt(0)"
            class="row--attention"
          >
            <span> {{ $t('stakingV3.claimRewardsNow') }}</span>
          </div>
        </div>
      </div>

      <astar-button
        :disabled="totalRewards <= BigInt(0)"
        class="button--claim"
        @click="claimRewards"
      >
        <span class="button--claim__label">{{ $t('stakingV3.claimYourRewards') }}</span>
        <span class="button--claim__amount">
          <token-balance-native :balance="totalRewards.toString()" :show-token-symbol="false" />
          <span class="button--claim__symbol">{{ nativeTokenSymbol }}</span>
        </span>
      </astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { useNetworkInfo } from 'src/hooks';
import { RewardsPerPeriod, useDappStaking } from '../hooks';
import { defineComponent, PropType } from 'vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export default defineComponent({
  components: { TokenBalanceNative },
  props: {
    totalRewards: {
      type: BigInt as unknown as PropType<bigint>,
      required: true,
    },
    rewardsPerPeriod: {
      type: Array as unknown as PropType<RewardsPerPeriod[]>,
      required: true,
    },
    claimRewards: {
      type: Function as unknown as PropType<(contractAddress: string) => Promise<void>>,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    const { rewardExpiresInNextPeriod, formatPeriod } = useDappStaking();

    return { nativeTokenSymbol, formatPeriod, rewardExpiresInNextPeriod };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/your-rewards.scss';
</style>

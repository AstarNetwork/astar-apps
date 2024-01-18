<template>
  <div class="wrapper--your-rewards">
    <div class="row--title">
      <span> {{ $t('stakingV3.yourRewards') }} </span>
    </div>

    <div class="container--rewards">
      <div v-if="rewardsPerPeriod.length > 0">
        <div class="rows--rewards">
          <div v-for="reward in rewardsPerPeriod" :key="reward.period" class="box--rewards">
            <div>
              <span class="text--title">
                {{ $t('stakingV3.period', { period: formatPeriod(reward.period) }) }}
              </span>
            </div>
            <div class="row--claim-info">
              <div>
                <span class="text--vivid">
                  {{ $t('stakingV3.availableToClaim') }}
                </span>
              </div>
              <div>
                <div>
                  <span class="text--vivid">
                    {{ $t('stakingV3.eras', { era: reward.erasToReward }) }}
                  </span>
                </div>
                <div>
                  <span class="text--vivid-bond">
                    <token-balance-native :balance="reward.rewards.toString()" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="rewardExpiresInNextPeriod(reward.period) && reward.rewards > BigInt(0)"
            class="row--attention"
          >
            <span> {{ $t('stakingV3.claimRewardsNow') }}</span>
          </div>
        </div>
        <div>
          <astar-button
            :disabled="totalRewards <= BigInt(0)"
            class="button--claim"
            @click="claimRewards"
          >
            <span>{{ $t('stakingV3.claim') }}</span>
            <span><token-balance-native :balance="totalRewards.toString()" /></span>
          </astar-button>
        </div>
      </div>
      <div v-else>no</div>
    </div>
  </div>
</template>

<script lang="ts">
import { useNetworkInfo } from 'src/hooks';
import { RewardsPerPeriod, useDappStaking } from '../hooks';
import { defineComponent, PropType, computed } from 'vue';
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
  setup(props) {
    const { nativeTokenSymbol } = useNetworkInfo();
    const { rewardExpiresInNextPeriod, formatPeriod } = useDappStaking();

    const unclaimedEras = computed<number>(() =>
      props.rewardsPerPeriod.reduce((acc, cur) => acc + cur.erasToReward, 0)
    );

    return { nativeTokenSymbol, unclaimedEras, formatPeriod, rewardExpiresInNextPeriod };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/your-rewards.scss';
</style>

<template>
  <div class="wrapper--your-rewards">
    <div class="row--title">
      <span> {{ $t('stakingV3.yourRewards') }} </span>
    </div>
    <!-- Memo: Temporary UI -->
    <div class="row--claim-temporary">
      <div>
        <span class="text--lg">Unclaimed Eras: </span>
        <span class="text--lg">
          <b>{{ unclaimedEras }}</b>
        </span>
      </div>
      <div>
        <span class="text--lg">Claimable Amount: </span>
        <span class="text--lg">
          <b><token-balance-native :balance="totalRewards.toString()" /></b>
        </span>
      </div>
      <div>
        <astar-button
          :disabled="totalRewards <= BigInt(0)"
          class="button--claim"
          @click="claimRewards"
        >
          {{ $t('stakingV3.claim') }}
        </astar-button>
      </div>
    </div>
    <div v-if="rewardsPerPeriod.length > 0" class="container--rewards">
      <div class="box--rewards">
        <div v-for="reward in rewardsPerPeriod" :key="reward.period" class="box__row">
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
            {{ $t('stakingV3.claim') }}
          </astar-button>
        </div>
      </div>

      <!-- Memo: mocked UI - waiting for indexer -->
      <div v-if="false">
        <div class="box--rewards">
          <div class="box__row">
            <div class="row--claim-info">
              <div class="box__column">
                <div>
                  <span class="text--title">
                    {{ $t('stakingV3.period', { period: '004' }) }}
                  </span>
                </div>
                <div>
                  <span class="text--info">
                    {{ $t('stakingV3.eras', { era: 123 }) }}
                  </span>
                </div>
              </div>
              <div class="box__column">
                <div class="column--status-claimed">
                  <span>
                    {{ $t('stakingV3.claimed') }}
                  </span>
                </div>
                <div>
                  <span class="text--info-bond">
                    <token-balance-native :balance="'1000'" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="box__row">
            <div class="row--claim-info">
              <div class="box__column">
                <div>
                  <span class="text--title">
                    {{ $t('stakingV3.period', { period: '003' }) }}
                  </span>
                </div>
                <div>
                  <span class="text--info">
                    {{ $t('stakingV3.eras', { era: 123 }) }}
                  </span>
                </div>
              </div>
              <div class="box__column">
                <div class="column--status-claimed">
                  <span>
                    {{ $t('stakingV3.claimed') }}
                  </span>
                </div>
                <div>
                  <span class="text--info-bond">
                    <token-balance-native :balance="'1000'" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

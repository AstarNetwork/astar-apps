<template>
  <div class="wrapper--period-stats">
    <div class="title">
      <span>{{ period.toString().padStart(3, '0') }}</span>
      <span>{{ $t('stakingV3.stats') }}</span>
    </div>

    <div class="stats-content">
      <div class="stats-content__left">
        <div class="period-kpi-container">
          <div class="kpi-title">{{ $t('stakingV3.userRewardsApr') }}</div>
          <div class="apr-container">
            <div class="apr-basic">
              <div class="apr-title">{{ $t('stakingV3.basicApr') }}</div>
              <div class="value-unit">
                <span>--<small>%</small></span>
              </div>
            </div>
            <div class="apr-bonus">
              <div class="apr-title">{{ $t('stakingV3.bonusAPR') }}</div>
              <div class="value-unit">
                <span>--<small>%</small></span>
              </div>
            </div>
          </div>
        </div>
        <div class="period-kpi-container">
          <div class="kpi-title">{{ $t('stakingV3.tvl') }}</div>
          <div class="value-unit">
            <span>{{ tvlRatio ? (tvlRatio * 100).toFixed(1) : '--' }}<small>%</small></span>
          </div>
        </div>
        <div class="period-kpi-container">
          <div class="kpi-title">{{ $t('stakingV3.unmintedTokens') }}</div>
          <div>
            <div class="value-unit"><span>--</span></div>
            <div class="more-info">
              <router-link :to="RoutePath.Dashboard">
                {{ $t('stakingV3.moreInfoFor') }} {{ `\$${nativeTokenSymbol.toUpperCase()}`
                }}<astar-icon-arrow-right />
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-content__right">
        <dapp-stats-panel :title="$t('stakingV3.stakedAmount')" :data="stakesStats" />
        <dapp-stats-panel :title="$t('stakingV3.dappEarner')" :data="rewardsStats" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import DappStatsPanel, { PanelData } from './DappStatsPanel.vue';
import { usePeriodStats } from '../hooks';
import { sort } from 'src/v2/common';
import { Path as RoutePath } from 'src/router/routes';
import { useNetworkInfo } from 'src/hooks';

export default defineComponent({
  components: {
    DappStatsPanel,
  },
  props: {
    period: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { period } = toRefs(props);
    const { dappStatistics, tvlRatio } = usePeriodStats(period);

    const stakesStats = computed<PanelData[]>(() =>
      dappStatistics.value
        .map((x) => ({
          name: x.name,
          iconUrl: x.iconUrl,
          amount: BigInt(x.stakeAmount),
          address: x.address,
        }))
        .sort((a, b) => sort(a.amount, b.amount))
    );

    const rewardsStats = computed<PanelData[]>(() =>
      dappStatistics.value
        .map((x) => ({
          name: x.name,
          iconUrl: x.iconUrl,
          amount: x.rewardAmount,
          address: x.address,
        }))
        .sort((a, b) => sort(a.amount, b.amount))
    );

    const { nativeTokenSymbol } = useNetworkInfo();

    return { stakesStats, rewardsStats, tvlRatio, RoutePath, nativeTokenSymbol };
  },
});
</script>

<style scoped lang="scss">
@import './styles/period-stats.scss';
</style>

<template>
  <div class="v3-new-container">
    <div class="title">{{ period }} | {{ $t('stakingV3.stats') }}</div>
    <div class="stats-content">
      <div>
        <div class="period-kpi-container">
          <div>{{ $t('stakingV3.tvl') }}</div>
          <div>{{ tvlRatio ? (tvlRatio * 100).toFixed(1) : '--' }}%</div>
        </div>
      </div>
      <dapp-stats-panel :title="$t('stakingV3.stakedAmount')" :data="stakesStats" />
      <dapp-stats-panel :title="$t('stakingV3.dappEarner')" :data="rewardsStats" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import DappStatsPanel, { PanelData } from './DappStatsPanel.vue';
import { usePeriodStats } from '../hooks';
import { sort } from 'src/v2/common';

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
        }))
        .sort((a, b) => sort(a.amount, b.amount))
    );

    const rewardsStats = computed<PanelData[]>(() =>
      dappStatistics.value
        .map((x) => ({
          name: x.name,
          iconUrl: x.iconUrl,
          amount: x.rewardAmount,
        }))
        .sort((a, b) => sort(a.amount, b.amount))
    );

    return { stakesStats, rewardsStats, tvlRatio };
  },
});
</script>

<style scoped lang="scss">
@import 'src/css/quasar.variables.scss';

// TODO move to the common place
.v3-new-container {
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  border: 2px solid $navy-3;
  background: rgba(31, 47, 95, 0.2);
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  padding: 16px;
  gap: 64px;

  @media (min-width: $md) {
    padding: 48px;
  }
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (min-width: $md) {
    flex-direction: row;

    > div {
      width: 33%;
    }
  }
}

.title {
  font-size: 32px;
  font-weight: 900;
  line-height: normal;
}

.period-kpi-container {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  background: rgba(8, 16, 41, 0.3);

  div {
    padding: 8px 0;
  }

  div:first-child {
    font-size: 16px;
    font-weight: 700;
    line-height: normal;
  }

  div:nth-child(2) {
    text-align: right;
    font-size: 32px;
    font-weight: 800;
    line-height: normal;
    background: var(--Linear, linear-gradient(90deg, #0047ff 0%, #00d4ff 97.65%));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
</style>

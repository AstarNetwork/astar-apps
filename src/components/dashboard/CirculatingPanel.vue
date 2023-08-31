<template>
  <div v-if="!currentCirculating">
    <q-skeleton class="skeleton--value-panel" />
  </div>
  <div v-else class="wrapper--value">
    <div class="container container--chart">
      <div class="row--title">
        <span class="text--accent container--title--color">{{ $t('dashboard.tokenSupply') }}</span>
      </div>
      <div class="text--xlg row">
        <div>
          <span class="text--value text-color--neon">
            {{ formatNumber(totalSupply, 3) }} {{ symbol }}
          </span>
        </div>
      </div>
      <div class="row chart-row">
        <doughnut-chart :size="250" :sectors="pieSectors" :token-symbol="symbol" />
      </div>
      <div class="align-right text--xlg">
        <div>
          <span class="text--value text-color--neon">
            {{ $n(currentCirculating) }} {{ symbol }}
          </span>
        </div>
        <div>
          <span class="text--label">
            {{ $t('dashboard.circulating.supply', { totalSupply: formatNumber(totalSupply, 3) }) }}
          </span>
          <span class="text--label text-color--neon">
            {{ ((currentCirculating / totalSupply) * 100).toFixed(0) }} %
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useTokenDistribution } from 'src/hooks';
import { formatNumber } from '@astar-network/astar-sdk-core';
import { defineComponent, watchEffect, ref } from 'vue';
import DoughnutChart, { Sector } from '../common/DoughnutChart.vue';

export default defineComponent({
  components: {
    DoughnutChart,
  },
  props: {
    symbol: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { unknown, tvl, treasury, totalSupply, currentCirculating } = useTokenDistribution();
    const pieSectors = ref<Sector[]>([]);

    watchEffect(() => {
      pieSectors.value = [];

      pieSectors.value.push({
        value: tvl.value,
        label: 'TVL',
        color: '#0085FF',
      });
      pieSectors.value.push({
        value: treasury.value,
        label: 'Treasury',
        color: '#0085FFD9',
      });
      pieSectors.value.push({
        value: unknown.value,
        label: 'Rest',
        color: '#0F1C56CC',
      });
    });

    return { formatNumber, totalSupply, currentCirculating, pieSectors };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/dashboard.scss';

.container--chart {
  padding: 8px 16px 32px;

  @media (min-width: $sm) {
    padding: 22px 24px 32px;
  }
  @media (min-width: $xxl) {
    width: 560px;
  }
}
.chart-row {
  justify-content: center;
}
</style>

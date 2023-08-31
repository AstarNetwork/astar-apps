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
      <div class="align-right table--container">
        <div class="row--container">
          <div class="row--item">Circulating</div>
          <div class="row--item">{{ formatNumber(currentCirculating, 3) }}</div>
          <div class="row--item">
            ({{ ((currentCirculating / totalSupply) * 100).toFixed(0) }}%)
          </div>
        </div>
        <div class="row--container">
          <div class="row--item">Other</div>
          <div class="row--item">{{ formatNumber(totalSupply - currentCirculating, 3) }}</div>
          <div class="row--item">
            ({{ (((totalSupply - currentCirculating) / totalSupply) * 100).toFixed(0) }}%)
          </div>
        </div>
        <!-- <div>
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
        </div> -->
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
@import 'src/css/quasar.variables.scss';

.container--chart {
  padding: 8px 16px 32px;
  height: 514px;

  @media (min-width: $sm) {
    padding: 8px 24px 32px;
  }
  @media (min-width: $xxl) {
    width: 560px;
  }
}
.chart-row {
  justify-content: center;
}

.table--container {
  margin-top: 20px;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  letter-spacing: -0.32px;
  color: $astar-blue;
}

.row--container {
  display: flex;
  justify-content: flex-end;
}

.row--item {
  flex: 1 1 0px;
  justify-content: end;
  padding: 4px;
  max-width: 80px;
}

.skeleton--value-panel {
  height: 514px;
}

.row--title {
  padding: 16px 8px 0px 8px;
}
</style>

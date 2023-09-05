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
        <doughnut-chart
          :size="250"
          :sectors="pieSectors"
          :token-symbol="symbol"
          :is-dark-theme="isDarkTheme"
        />
      </div>
      <div class="align-right table--container">
        <div class="row--container">
          <div class="row--item">{{ $t('dashboard.circulating.circulating') }}</div>
          <div class="row--item">{{ formatNumber(currentCirculating, 3) }}</div>
          <div class="row--item">
            ({{ ((currentCirculating / totalSupply) * 100).toFixed(0) }}%)
          </div>
        </div>
        <div class="row--container">
          <div class="row--item">{{ $t('chart.others') }}</div>
          <div class="row--item">{{ formatNumber(totalSupply - currentCirculating, 3) }}</div>
          <div class="row--item">
            ({{ (((totalSupply - currentCirculating) / totalSupply) * 100).toFixed(0) }}%)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useTokenDistribution } from 'src/hooks';
import { formatNumber } from '@astar-network/astar-sdk-core';
import { defineComponent, watchEffect, ref, computed } from 'vue';
import DoughnutChart, { Sector } from '../common/DoughnutChart.vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'src/store';

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
  setup() {
    const store = useStore();
    const { t } = useI18n();
    const { locked, tvl, treasury, other, totalSupply, currentCirculating } =
      useTokenDistribution();
    const pieSectors = ref<Sector[]>([]);
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');

    watchEffect(() => {
      pieSectors.value = [];

      tvl.value &&
        pieSectors.value.push({
          value: tvl.value,
          label: t('common.staking'),
          color: '#0085FF',
        });
      treasury.value &&
        pieSectors.value.push({
          value: treasury.value,
          label: t('chart.treasury'),
          color: '#0085FFD9',
        });
      other.value &&
        pieSectors.value.push({
          value: other.value,
          label: t('dashboard.circulating.circulating'),
          color: '#0085FFB2',
        });
      locked.value &&
        pieSectors.value.push({
          value: locked.value,
          label: t('chart.others'),
          color: isDarkTheme.value ? '#0F1C56CC' : '#F7F7F8',
        });
    });

    return { formatNumber, totalSupply, currentCirculating, pieSectors, isDarkTheme };
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

<template>
  <div v-if="pieSectors.length === 0">
    <q-skeleton class="skeleton--value-panel" />
  </div>
  <div v-else class="wrapper--value">
    <div class="container container--chart">
      <div class="row--title">
        <span class="text--accent container--title--color">{{
          $t('dashboard.inflation.adjustableInflation')
        }}</span>
      </div>
      <div class="row chart-row">
        <doughnut-chart :size="250" :sectors="pieSectors" :is-dark-theme="isDarkTheme" />
      </div>
      <div class="align-right table--container">
        <div class="item--container">
          <div class="row--item">{{ $t('dashboard.inflation.treasury') }}</div>
          <div class="row--item">
            {{ numberFromPercentage(inflationParameters?.treasuryPart) }}%
          </div>
        </div>
        <div class="item--container">
          <div class="row--item">{{ $t('dashboard.inflation.bonus') }}</div>
          <div class="row--item">{{ numberFromPercentage(inflationParameters?.bonusPart) }}%</div>
        </div>
        <div class="item--container">
          <div class="row--item">{{ $t('dashboard.inflation.collators') }}</div>
          <div class="row--item">
            {{ numberFromPercentage(inflationParameters?.collatorsPart) }}%
          </div>
        </div>
        <div class="item--container">
          <div class="row--item">{{ $t('dashboard.inflation.dAppRewards') }}</div>
          <div class="row--item">{{ numberFromPercentage(inflationParameters?.dappsPart) }}%</div>
        </div>
        <div class="item--container">
          <div class="row--item">{{ $t('dashboard.inflation.baseStakers') }}</div>
          <div class="row--item">
            {{ numberFromPercentage(inflationParameters?.baseStakersPart) }}%
          </div>
        </div>
        <div class="item--container">
          <div class="row--item">{{ $t('dashboard.inflation.adjustableStakers') }}</div>
          <div class="row--item">
            {{ numberFromPercentage(inflationParameters.adjustableStakersPart) }}%
          </div>
        </div>
        <div class="item--container"></div>
        <div class="item--container">
          <div class="row--item"></div>
          <div class="row--item small">
            ({{
              $t('dashboard.inflation.activeAdjustable', {
                percentage: numberFromPercentage(adjustableStakersPercentage),
              })
            }})
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useInflation } from 'src/hooks';
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
    const { inflationParameters, realizedAdjustableStakersPart } = useInflation();
    const pieSectors = ref<Sector[]>([]);
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');

    const numberFromPercentage = (value?: number): number | string =>
      value !== undefined ? value * 100 : '--';

    const adjustableStakersPercentage = computed<number>(
      () =>
        Math.round(
          (realizedAdjustableStakersPart.value / inflationParameters.value.adjustableStakersPart) *
            100
        ) / 100
    );

    watch(
      [isDarkTheme, inflationParameters],
      async () => {
        const params = inflationParameters.value;

        if (!params) return;

        pieSectors.value = [];

        pieSectors.value.push({
          value: params.treasuryPart,
          label: t('dashboard.inflation.treasury'),
          color: '#0085FFCC',
        });

        pieSectors.value.push({
          value: params.collatorsPart,
          label: t('dashboard.inflation.collators'),
          color: '#0085FFB2',
        });

        pieSectors.value.push({
          value: params.baseStakersPart,
          label: t('dashboard.inflation.baseStakers'),
          color: '#0085FF99',
        });

        pieSectors.value.push({
          value: params.bonusPart,
          label: t('dashboard.inflation.bonus'),
          color: '#0085FF',
        });

        pieSectors.value.push({
          value: params.dappsPart,
          label: t('dashboard.inflation.dAppRewards'),
          color: '#0085FF66',
        });

        pieSectors.value.push({
          value: params.adjustableStakersPart,
          label: t('dashboard.inflation.adjustableStakersShort'),
          color: isDarkTheme.value ? '#0085FF4C' : '#F7F7F8',
        });
      },
      { immediate: true }
    );

    return {
      pieSectors,
      isDarkTheme,
      inflationParameters,
      realizedAdjustableStakersPart,
      adjustableStakersPercentage,
      numberFromPercentage,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/dashboard.scss';
@import 'src/css/quasar.variables.scss';

.container--chart {
  height: auto;
  padding-bottom: 16px;
}
.chart-row {
  justify-content: center;
}

.table--container {
  display: flex;
  flex-direction: column;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.32px;
  color: $astar-blue;

  @media screen and (min-width: $md) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 16px;
  }
}

.item--container {
  display: flex;
  flex-direction: row;

  > :last-child {
    margin-left: auto;
  }
}

.small {
  font-size: 12px;
  padding: 0px;
  margin-top: -12px;
}

.row--item {
  padding: 4px;
}

.skeleton--value-panel {
  height: 514px;
}

.row--title {
  padding: 16px 8px 0px 8px;
}
</style>

<template>
  <div v-if="!hasData">
    <q-skeleton class="skeleton--chart inflation--skeleton" />
  </div>
  <div v-else>
    <div class="container--component">
      <div class="row">
        <span class="text--accent container--title--color">{{
          $t('dashboard.inflation.currentInflationRate')
        }}</span>
      </div>
      <div class="row chart--value">
        <div>
          <span class="text--value text-color--neon">{{ estimatedInflation?.toFixed(2) }}%</span>
        </div>
      </div>
      <div class="chart">
        <highcharts class="highcharts" :options="chartOptions"></highcharts>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { Chart } from 'highcharts-vue';
import { useStore } from 'src/store';
import { titleFormatter, seriesFormatter } from 'src/modules/token-api';
import Highcharts from 'highcharts';
import { useInflation } from 'src/hooks';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    highcharts: Chart,
  },

  setup() {
    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const getBackgroundColor = (): string => (isDarkTheme.value ? '#060b23' : '#fff');
    const getLineColor = (): string => (isDarkTheme.value ? 'rgba(108,111,111,0.1)' : '#F7F7F8');
    const getTextColor = (): string => (isDarkTheme.value ? '#5F656F' : '#B1B7C1');
    const hasData = ref<boolean>(false);
    const { t } = useI18n();
    const {
      maximumInflationData,
      realizedInflationData,
      estimatedInflation,
      inflationParameters,
      estimateRealizedInflation,
    } = useInflation();

    const maximumInflationRate = computed<string>(() =>
      ((inflationParameters.value?.maxInflationRate ?? 0) * 100).toFixed(1)
    );

    Highcharts.setOptions({
      lang: {
        thousandsSep: ',',
      },
    });
    const chartOptions = computed(() => {
      return {
        title: {
          text: '',
        },
        chart: {
          backgroundColor: getBackgroundColor(),
          zoomType: 'x',
        },
        xAxis: {
          type: 'number',
          lineColor: getLineColor(),
          tickColor: getLineColor(),
          labels: {
            style: {
              color: getTextColor(),
            },
          },
        },
        yAxis: {
          title: {
            text: '',
          },
          opposite: true,
          gridLineColor: getLineColor(),
          labels: {
            style: {
              color: getTextColor(),
            },
            formatter: (data: any) => titleFormatter(false, data),
          },
        },
        legend: {
          enabled: true,
          itemStyle: {
            color: getTextColor(),
          },
          itemHoverStyle: {
            color: '#0085FF',
          },
        },
        plotOptions: {
          area: {
            marker: {
              enabled: false,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true,
                },
              },
            },
            lineWidth: 1,
            states: {
              hover: {
                lineWidth: 1,
              },
            },
            threshold: null,
          },
        },
        tooltip: {
          valueDecimals: 'tooltip',
          shared: true,
        },
        series: seriesFormatter({
          isMultipleLine: true,
          tooltip: t('dashboard.inflation.realizedInflation'),
          data: realizedInflationData.value,
          mergedData: maximumInflationData.value,
          textTvl: t('dashboard.inflation.maximumInflation', {
            rate: maximumInflationRate.value,
          }),
        }),
        credits: {
          enabled: false,
        },
      };
    });

    watch([isDarkTheme], () => {
      chartOptions.value.chart.backgroundColor = getBackgroundColor();
      chartOptions.value.xAxis.lineColor = getLineColor();
      chartOptions.value.xAxis.tickColor = getLineColor();
      chartOptions.value.yAxis.gridLineColor = getLineColor();
      chartOptions.value.yAxis.labels.style.color = getTextColor();
      chartOptions.value.xAxis.labels.style.color = getTextColor();
    });

    watch(
      [maximumInflationData],
      () => {
        if (maximumInflationData.value && maximumInflationData.value.length > 0) {
          hasData.value = true;
          chartOptions.value.series[0].data = maximumInflationData.value;
        } else {
          hasData.value = false;
        }
      },
      { immediate: true }
    );

    return {
      estimatedInflation,
      chartOptions,
      hasData,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/chart-panel.scss';
@import 'src/css/quasar.variables.scss';

.container--component {
  box-shadow: $container-border-shadow-light;
  border-radius: 6px;
  padding: 8px 16px;
}

.inflation--skeleton {
  height: 324px;
}

.body--dark {
  .container--component {
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1);
    background-color: $container-bg-dark;
  }
}
</style>

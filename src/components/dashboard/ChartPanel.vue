<template>
  <div v-if="!hasData">
    <q-skeleton class="skeleton--chart" />
  </div>
  <div v-else>
    <div class="container--chart">
      <div class="row">
        <span class="text--accent container--title--color">{{ $t(title) }}</span>
      </div>
      <div class="row chart--value">
        <span class="text--xlg">{{ defaultValue }}</span>
      </div>
      <div class="chart">
        <highcharts :options="chartOptions"></highcharts>
        <chart-filter :range-filter="rangeFilter" @filterChanged="handleFilterChanged" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, PropType } from 'vue';
import { Chart } from 'highcharts-vue';
import { useStore } from 'src/store';
import ChartFilter, { DEFAULT_FILTER } from 'src/components/dashboard/ChartFilter.vue';
import { titleFormatter, valueDecimalsFormatter, seriesFormatter } from 'src/modules/token-api';
import Highcharts from 'highcharts';
import { useBreakpoints } from 'src/hooks';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    highcharts: Chart,
    ChartFilter,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    tooltip: {
      type: String,
      required: true,
    },
    defaultValue: {
      type: String,
      required: true,
    },
    data: {
      type: Array as PropType<number[][] | null>,
      required: false,
      default: null,
    },
    mergedData: {
      type: Array as PropType<number[][] | null>,
      required: false,
      default: null,
    },
    rangeFilter: {
      type: String,
      default: DEFAULT_FILTER,
    },
    isMultipleLine: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['filterChanged'],
  setup(props, { emit }) {
    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const getBackgroundColor = (): string => (isDarkTheme.value ? '#222829' : '#fff');
    const getLineColor = (): string => (isDarkTheme.value ? 'rgba(108,111,111,0.1)' : '#F7F7F8');
    const getTextColor = (): string => (isDarkTheme.value ? '#5F656F' : '#B1B7C1');
    const hasData = ref<boolean>(false);
    const { width, screenSize } = useBreakpoints();
    const { t } = useI18n();

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
          height: width.value > screenSize.xxl ? '250px' : '200px',
        },
        xAxis: {
          type: 'datetime',
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
            formatter: (data: any) => titleFormatter(t(props.title), data),
          },
        },
        legend: {
          enabled: props.isMultipleLine,
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
          valueDecimals: valueDecimalsFormatter(props.title),
          shared: true,
        },
        series: seriesFormatter({
          isMultipleLine: props.isMultipleLine,
          tooltip: t(props.tooltip),
          data: props.data,
          mergedData: props.mergedData,
          textTvl: t('dashboard.tvl'),
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

    const handleFilterChanged = (filter: string): void => {
      emit('filterChanged', filter);
    };

    watch([props], () => {
      if (props.isMultipleLine) {
        chartOptions.value.series[0].data = props.mergedData;
      } else {
        chartOptions.value.series[0].data = props.data;
      }

      if (props.data && props.data.length > 0) {
        hasData.value = true;
      } else {
        hasData.value = false;
      }
    });

    return {
      chartOptions,
      hasData,
      handleFilterChanged,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';
</style>

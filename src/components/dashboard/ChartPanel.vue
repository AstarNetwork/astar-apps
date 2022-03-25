<template>
  <div>
    <div class="container">
      <div class="row">
        <span class="text--md">{{ title }}</span>
      </div>
      <div class="row">
        <span class="text--xlg">{{ defaultValue }}</span>
      </div>
      <div class="chart">
        <highcharts :options="chartOptions"></highcharts>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { Chart } from 'highcharts-vue';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    highcharts: Chart,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    defaultValue: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const getBackgroundColor = (): string => (isDarkTheme.value ? '#2c3335' : '#fff');
    const chartOptions = ref({
      title: {
        text: '',
      },
      chart: {
        backgroundColor: getBackgroundColor(),
        zoomType: 'x',
        height: '200px',
      },
      xAxis: {
        type: 'datetime',
      },
      yAxis: {
        title: {
          text: '',
        },
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: { x1: 0.1, y1: 0.5, x2: 0.9, y2: 0.5 },
            stops: [
              [0, 'rgba(12, 134, 245, 0)'],
              [1, 'rgba(7, 200, 254, 0.26)'],
            ],
          },
          marker: {
            radius: 0,
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
      series: [
        {
          name: props.title,
          type: 'area',
          data: props.data,
        },
      ],
    });

    watch([isDarkTheme], () => {
      chartOptions.value.chart.backgroundColor = getBackgroundColor();
    });

    watch([props], () => {
      chartOptions.value.series[0].data = props.data;
    });

    return {
      chartOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';
</style>

<template>
  <div v-if="hasData">
    <div class="container">
      <div class="row">
        <span class="text--accent container--title--color">{{ title }}</span>
      </div>
      <div class="row chart--value">
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
    const hasData = ref<boolean>(false);

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
        gridLineColor: '#666',
      },
      legend: {
        enabled: false,
      },
      plotOptions: {
        area: {
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
          color: '#05B6FD',
        },
      ],
    });

    watch([isDarkTheme], () => {
      chartOptions.value.chart.backgroundColor = getBackgroundColor();
    });

    watch([props], () => {
      chartOptions.value.series[0].data = props.data;

      if (props.data && props.data.length > 0) {
        hasData.value = true;
      } else {
        hasData.value = false;
      }
    });

    return {
      chartOptions,
      hasData,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';
</style>

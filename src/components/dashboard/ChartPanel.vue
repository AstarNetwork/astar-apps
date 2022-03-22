<template>
  <div class="wrapper--chart-panel">
    <div class="container">
      <div class="row">
        <span class="text--md">{{ title }}</span>
      </div>
      <div class="row">
        <span class="text--xlg">{{ defaultValue }}</span>
      </div>
      <div>
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
  },
  setup() {
    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const getBackgroundColor = (): string => (isDarkTheme.value ? '#2c3335' : '#fff');
    const chartOptions = ref({
      title: {
        text: '',
      },
      chart: {
        backgroundColor: getBackgroundColor(),
      },
      series: [
        {
          data: [1, 2, 3], // sample data
        },
      ],
    });

    watch([isDarkTheme], () => {
      chartOptions.value.chart.backgroundColor = getBackgroundColor();
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


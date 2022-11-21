<template>
  <div v-if="data.length > 0">
    <chart-panel
      :data="data"
      title="dashboard.chart.tvl.title"
      tooltip="dashboard.chart.tvl.tooltip"
      :default-value="latestValue"
      class="wrapper--chart"
      :is-multiple-line="false"
      @filter-changed="handleFilterChanged"
    />
  </div>
</template>
<script lang="ts">
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { Duration, filterStatsData, StatsDetail, StatsType } from 'src/modules/token-api';
import { defineComponent, PropType, ref, watchEffect } from 'vue';

export default defineComponent({
  components: {
    ChartPanel,
  },
  props: {
    statsDetails: {
      type: Array as PropType<StatsDetail[]>,
      required: true,
    },
    statsType: {
      type: String as PropType<StatsType>,
      required: true,
    },
  },
  setup(props) {
    const data = ref<number[][] | null>(null);
    const latestValue = ref<number>(0);
    const currentFilter = ref<Duration>('90 days');

    const handleFilterChanged = (filter: Duration): void => {
      currentFilter.value = filter;
    };

    watchEffect(() => {
      data.value = filterStatsData({
        data: props.statsDetails,
        currentFilter: currentFilter.value,
        property: props.statsType,
      });
      latestValue.value = data.value[data.value.length - 1][1];
    });

    return { handleFilterChanged, data, latestValue };
  },
});
</script>

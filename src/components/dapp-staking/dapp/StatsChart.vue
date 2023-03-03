<template>
  <div v-if="data && data.length > 0">
    <chart-panel
      :data="data"
      :title="`chart.${statsType}.title`"
      :tooltip="`chart.${statsType}.tooltip`"
      :default-value="latestValue"
      :is-multiple-line="false"
      @filter-changed="handleFilterChanged"
    />
  </div>
</template>
<script lang="ts">
import ChartPanel from 'src/components/common/ChartPanel.vue';
import { Duration, filterStatsData, StatsDetail, StatsType } from '@astar-network/astar-sdk-core';
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
  setup(props, { emit }) {
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
      if (data.value.length > 0) {
        latestValue.value = data.value[data.value.length - 1][1];
        emit('setIsDisplayCharts', true);
      } else {
        emit('setIsDisplayCharts', false);
      }
    });

    return { handleFilterChanged, data, latestValue };
  },
});
</script>

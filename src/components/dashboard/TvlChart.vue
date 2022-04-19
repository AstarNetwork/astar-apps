<template>
  <chart-panel
    :data="filteredData"
    title="Total Value Locked"
    :default-value="currentTvl"
    class="wrapper--chart"
    @filter-changed="handleFilterChanged"
  />
</template>

<script lang="ts">
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { useTvlHistorical } from 'src/hooks';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    ChartPanel,
  },
  setup() {
    const { filteredData, currentTvl, handleFilterChanged } = useTvlHistorical();
    return {
      filteredData,
      currentTvl,
      handleFilterChanged,
    };
  },
});
</script>

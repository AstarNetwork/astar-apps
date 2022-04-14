<template>
  <chart-panel
    :data="filteredData"
    title="Total Value Locked"
    :default-value="currentTvl"
    class="wrapper--chart"
    y-label-prefix="$"
    @filter-changed="handleFilterChanged"
  />
</template>

<script lang="ts">
import { DEFAULT_FILTER } from 'src/components/dashboard/ChartFilter.vue';
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { Duration, filterTvlData, getTvlData } from 'src/modules/token-api';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  components: {
    ChartPanel,
  },
  props: {
    network: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const mergedArray = ref<number[][] | null>(null);
    const filteredData = ref<number[][] | null>(null);
    const currentTvl = ref<string>('');
    const currentFilter = ref<Duration>(DEFAULT_FILTER);

    const loadData = async (network: string): Promise<void> => {
      const { mergedData, tvl } = await getTvlData({ network });
      mergedArray.value = mergedData;
      currentTvl.value = tvl;
    };

    const handleFilterChanged = async (filter: Duration): Promise<void> => {
      if (currentFilter.value !== filter) {
        currentFilter.value = filter;
      }
    };

    watch(
      [props],
      async () => {
        try {
          if (!props.network) return;
          await loadData(props.network);
        } catch (error) {
          console.error(error);
        }
      },
      { immediate: false }
    );

    watch(
      [currentFilter, mergedArray],
      () => {
        try {
          if (!mergedArray.value) return;
          const data = filterTvlData({
            mergedArray: mergedArray.value,
            duration: currentFilter.value,
          });
          filteredData.value = data;
        } catch (error) {
          console.error(error);
        }
      },
      { immediate: false }
    );

    return {
      filteredData,
      currentTvl,
      handleFilterChanged,
    };
  },
});
</script>

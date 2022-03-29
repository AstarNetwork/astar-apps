<template>
  <chart-panel
    :data="data"
    title="Total Value Locked"
    :default-value="currentTvl"
    class="wrapper--chart"
    @filter-changed="handleFilterChanged"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import axios from 'axios';
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { ChartData } from 'src/components/dashboard/ChartData';
import { API_URL, formatNumber } from 'src/components/dashboard/utils';
import { DEFAULT_FILTER } from 'src/components/dashboard/ChartFilter.vue';

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
    const data = ref<ChartData>([[1, 1]]);
    const currentTvl = ref<string>('');
    const currentFilter = ref<string>(DEFAULT_FILTER);

    const loadData = async (): Promise<void> => {
      if (!props.network) return;
      const priceUrl = `${API_URL}/v1/${props.network.toLowerCase()}/token/tvl/${
        currentFilter.value
      }`;
      const result = await axios.get<ChartData>(priceUrl);
      data.value = result.data.map((pair) => {
        return [Number(pair[0]) * 1000, pair[1]];
      });

      if (data.value && data.value.length > 0) {
        currentTvl.value = `\$${formatNumber(data.value[data.value.length - 1][1], 1)}`;
      }
    };

    const handleFilterChanged = async (filter: string): Promise<void> => {
      console.log('filter changed', filter);
      currentFilter.value = filter;
      await loadData();
    };

    watch([props], () => {
      if (props.network) {
        loadData();
      }
    });

    return {
      data,
      currentTvl,
      handleFilterChanged,
    };
  },
});
</script>

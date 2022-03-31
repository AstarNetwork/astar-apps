<template>
  <chart-panel
    :data="data"
    title="Token Price"
    :default-value="currentPrice"
    class="wrapper--chart"
    :range-filter="currentFilter"
    @filter-changed="handleFilterChanged"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import axios from 'axios';
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { ChartData } from 'src/components/dashboard/ChartData';
import { API_URL } from './utils';
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
    const currentPrice = ref<string>('');
    const currentFilter = ref<string>(DEFAULT_FILTER);

    const loadData = async () => {
      if (!props.network) return;
      const priceUrl = `${API_URL}/v1/${props.network.toLowerCase()}/token/price/${
        currentFilter.value
      }`;
      const result = await axios.get<ChartData>(priceUrl);
      // filter out trading beginning
      const startDate = new Date(2022, 1, 24);
      data.value = result.data.filter((x) => x[0] >= startDate.getTime());

      if (data.value && data.value.length > 0) {
        currentPrice.value = `\$${data.value[data.value.length - 1][1].toFixed(6)}`;
      }
    };

    const handleFilterChanged = async (filter: string): Promise<void> => {
      if (currentFilter.value !== filter) {
        currentFilter.value = filter;
        await loadData();
      }
    };

    watch([props], () => {
      if (props.network) {
        loadData();
      }
    });

    loadData();

    return {
      data,
      currentPrice,
      currentFilter,
      handleFilterChanged,
    };
  },
});
</script>

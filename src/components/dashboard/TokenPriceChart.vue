<template>
  <chart-panel
    :data="data"
    :title="textChart.tokenPrice.title || ''"
    :tooltip="textChart.tokenPrice.tooltip"
    :default-value="currentPrice"
    class="wrapper--chart"
    :range-filter="currentFilter"
    :is-multiple-line="false"
    :is-price="true"
    @filter-changed="handleFilterChanged"
  />
</template>

<script lang="ts">
import axios from 'axios';
import { ChartData } from 'src/components/dashboard/ChartData';
import ChartPanel from 'src/components/common/ChartPanel.vue';
import { defineComponent, ref, watch } from 'vue';
import { textChart } from 'src/modules/token-api';
import { TOKEN_API_URL } from '@astar-network/astar-sdk-core';

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
    const currentFilter = ref<string>('90 days');

    const loadData = async () => {
      if (!props.network) return;
      const priceUrl = `${TOKEN_API_URL}/v1/${props.network.toLowerCase()}/token/price/${
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

    watch([props], async () => {
      try {
        if (props.network) {
          await loadData();
        }
      } catch (error) {
        console.error(error);
      }
    });

    loadData();

    return {
      data,
      currentPrice,
      currentFilter,
      handleFilterChanged,
      textChart,
    };
  },
});
</script>

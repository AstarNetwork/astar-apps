<template>
  <chart-panel
    :data="data"
    :title="textChart.ttlTransactions.title || ''"
    :tooltip="textChart.ttlTransactions.tooltip"
    :default-value="totalTransactionsNumber"
    :is-multiple-line="false"
    class="wrapper--chart"
    @filter-changed="handleFilterChanged"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import axios from 'axios';
import ChartPanel from 'src/components/common/ChartPanel.vue';
import { ChartData } from 'src/components/dashboard/ChartData';
import { textChart } from 'src/modules/token-api';
import { DEFAULT_FILTER } from 'src/components/dashboard/ChartFilter.vue';
import { TOKEN_API_URL, formatNumber } from '@astar-network/astar-sdk-core';

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
    const totalTransactionsNumber = ref<string>('');
    const currentFilter = ref<string>(DEFAULT_FILTER);

    const loadData = async () => {
      if (!props.network) return;
      const txUrl = `${TOKEN_API_URL}/v1/${props.network.toLowerCase()}/node/tx-perblock/${
        currentFilter.value
      }`;
      const result = await axios.get<ChartData>(txUrl);
      data.value = result.data.map((pair) => {
        return [Number(pair[0]), pair[1]];
      });

      if (data.value) {
        const sum = data.value.reduce((previous, current) => current[1] + previous, 0);
        totalTransactionsNumber.value = formatNumber(sum, 1);
      }
    };

    const handleFilterChanged = async (filter: string): Promise<void> => {
      if (currentFilter.value != filter) {
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
      totalTransactionsNumber,
      handleFilterChanged,
      textChart,
    };
  },
});
</script>

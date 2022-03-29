<template>
  <chart-panel
    :data="data"
    title="Total Transactions"
    :default-value="totalTransactionsNumber"
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
    const totalTransactionsNumber = ref<string>('');
    const currentFilter = ref<string>(DEFAULT_FILTER);

    const loadData = async () => {
      if (!props.network) return;
      const priceUrl = `${API_URL}/v1/${props.network.toLowerCase()}/node/tx-perblock/${
        currentFilter.value
      }`;
      const result = await axios.get<ChartData>(priceUrl);
      data.value = result.data.map((pair) => {
        return [Number(pair[0]), pair[1]];
      });

      if (data.value) {
        const sum = data.value.reduce((previous, current) => current[1] + previous, 0);
        totalTransactionsNumber.value = formatNumber(sum, 1);
      }
    };

    const handleFilterChanged = async (filter: string): Promise<void> => {
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
      totalTransactionsNumber,
      handleFilterChanged,
    };
  },
});
</script>

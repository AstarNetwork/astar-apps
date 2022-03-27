<template>
  <chart-panel
    :data="data"
    title="Total Transactions"
    :default-value="currentTransactionsNumber"
    class="wrapper--chart"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import axios from 'axios';
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { ChartData } from 'src/components/dashboard/ChartData';
import { API_URL, formatNumber } from 'src/components/dashboard/utils';

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
    const currentTransactionsNumber = ref<string>('');

    const loadData = async () => {
      if (!props.network) return;
      const priceUrl = `${API_URL}/v1/${props.network.toLowerCase()}/node/tx-perblock/1%20year`;
      const result = await axios.get<ChartData>(priceUrl);
      data.value = result.data.map((pair) => {
        return [Number(pair[0]), pair[1]];
      });

      if (data.value) {
        currentTransactionsNumber.value = `${formatNumber(
          data.value[data.value.length - 1][1],
          1
        )}`;
      }
    };

    loadData();

    watch([props], () => {
      if (props.network) {
        loadData();
      }
    });

    return {
      data,
      currentTransactionsNumber,
    };
  },
});
</script>

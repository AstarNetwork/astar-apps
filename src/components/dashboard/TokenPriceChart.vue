<template>
  <chart-panel
    :data="data"
    title="Token Price"
    :default-value="currentPrice"
    class="wrapper--chart"
  />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import axios from 'axios';
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { ChartData } from 'src/components/dashboard/ChartData';

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

    const loadData = async () => {
      const priceUrl = `http://localhost:3000/api/v1/${props.network.toLowerCase()}/token/price/1%20year`;
      const result = await axios.get<ChartData>(priceUrl);
      data.value = result.data;

      if (data.value) {
        currentPrice.value = `\$${data.value[data.value.length - 1][1].toFixed(6)}`;
      }
    };

    watch([props], () => {
      if (props.network) {
        loadData();
      }
    });

    return {
      data,
      currentPrice,
    };
  },
});
</script>

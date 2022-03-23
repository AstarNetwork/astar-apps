<template>
  <div class="wrapper--charts">
    <chart-panel
      :data="priceData"
      title="Token Price"
      :default-value="currentTokenPrice"
      class="wrapper--chart"
    />
    <chart-panel
      :data="data"
      title="Dapps Staking Total Value Locked"
      :default-value="chartDefaultValue"
      class="wrapper--chart"
    />
    <chart-panel
      :data="transactionsData"
      title="Total Transactions"
      :default-value="currentNumberOfTransactions"
      class="wrapper--chart"
    />
  </div>
</template>

<script lang='ts'>
import { defineComponent, ref } from 'vue';
import axios from 'axios';
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { ChartData } from 'src/components/dashboard/ChartData';

export default defineComponent({
  components: {
    ChartPanel,
  },
  setup() {
    const tvlUrl = 'http://localhost:3000/api/v1/astar/dapps-staking/tvl/1%20year';
    const priceUrl = 'http://localhost:3000/api/v1/astar/token/price/1%20year';
    const transactionsUrl = 'http://localhost:3000/api/v1/astar/node/tx-perblock/1%20year';
    const data = ref<ChartData>([[1, 1]]);
    const priceData = ref<ChartData>([[1, 1]]);
    const transactionsData = ref<ChartData>([[1, 1]]);
    const chartDefaultValue = ref<string>('');
    const currentTokenPrice = ref<string>('');
    const currentNumberOfTransactions = ref<string>('');

    const formatNumber = (value: number, digits: number): string => {
      const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'k' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'G' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'P' },
        { value: 1e18, symbol: 'E' },
      ];
      const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
      var item = lookup
        .slice()
        .reverse()
        .find(function (item) {
          return value >= item.value;
        });

      return item ? (value / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
    };

    const loadData = async (): Promise<void> => {
      const result = await axios.get<ChartData>(tvlUrl);
      data.value = result.data.map((pair) => {
        return [Number(pair[0]), pair[1]];
      });

      if (data.value) {
        chartDefaultValue.value = `\$${formatNumber(data.value[data.value.length - 1][1], 1)}`;
      }

      const priceResult = await axios.get<ChartData>(priceUrl);
      priceData.value = priceResult.data;

      if (priceData.value) {
        currentTokenPrice.value = `\$${priceData.value[priceData.value.length - 1][1].toFixed(6)}`;
      }

      const transactionsResult = await axios.get<ChartData>(transactionsUrl);
      transactionsData.value = transactionsResult.data.map((pair) => {
        return [Number(pair[0]), pair[1]];
      });

      if (transactionsData.value) {
        currentNumberOfTransactions.value = `\$${formatNumber(
          transactionsData.value[transactionsData.value.length - 1][1],
          1
        )}`;
      }
    };

    loadData();

    return {
      data,
      priceData,
      transactionsData,
      chartDefaultValue,
      currentTokenPrice,
      currentNumberOfTransactions,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';
</style>
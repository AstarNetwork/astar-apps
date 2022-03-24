<template>
  <div class="wrapper--charts">
    <token-price-chart :network="chain" />
    <tvl-chart :network="chain" />
    <total-transactions :network="chain" />
  </div>
</template>

<script lang='ts'>
import { defineComponent, computed } from 'vue';
import TokenPriceChart from 'src/components/dashboard/TokenPriceChart.vue';
import TvlChart from 'src/components/dashboard/TvlChart.vue';
import TotalTransactions from 'src/components/dashboard/TotalTransactionsChart.vue';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    TokenPriceChart,
    TvlChart,
    TotalTransactions,
  },
  setup() {
    const store = useStore();

    const chain = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.chain : '';
    });

    return {
      chain,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';
</style>
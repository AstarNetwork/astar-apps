<template>
  <div class="wrapper--charts">
    <value-panel title="Current Circulating Supply" value="222" />
    <value-panel title="Current Supply" value="333" />
    <token-price-chart :network="chain" />
    <tvl-chart :network="chain" />
    <total-transactions-chart :network="chain" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import TokenPriceChart from 'src/components/dashboard/TokenPriceChart.vue';
import TvlChart from 'src/components/dashboard/TvlChart.vue';
import TotalTransactionsChart from 'src/components/dashboard/TotalTransactionsChart.vue';
import ValuePanel from 'src/components/dashboard/ValuePanel.vue';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    TokenPriceChart,
    TvlChart,
    TotalTransactionsChart,
    ValuePanel,
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

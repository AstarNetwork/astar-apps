<template>
  <div class="wrapper--charts">
    <div class="container--chart-panels">
      <div class="container--value-panel">
        <value-panel title="Current Circulating Supply" :value="circulatingSupply" />
        <value-panel title="Total Supply" :value="totalSupply" />
      </div>
      <tvl-chart :network="chainInfo.chain" />
      <total-transactions-chart :network="chainInfo.chain" />
      <token-price-chart :network="chainInfo.chain" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import axios from 'axios';
import TokenPriceChart from 'src/components/dashboard/TokenPriceChart.vue';
import TvlChart from 'src/components/dashboard/TvlChart.vue';
import TotalTransactionsChart from 'src/components/dashboard/TotalTransactionsChart.vue';
import ValuePanel from 'src/components/dashboard/ValuePanel.vue';
import { useStore } from 'src/store';
import { API_URL } from './utils';

interface StatsData {
  generatedAt: number;
  totalSupply: number;
  circulatingSupply: number;
}

export default defineComponent({
  components: {
    TokenPriceChart,
    TvlChart,
    TotalTransactionsChart,
    ValuePanel,
  },
  setup() {
    const store = useStore();
    const totalSupply = ref<string>('');
    const circulatingSupply = ref<string>('');

    const chainInfo = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo : {};
    });

    const loadStats = async () => {
      if (!chainInfo.value || !chainInfo.value.chain) return;

      const statsUrl = `${API_URL}/v1/${chainInfo.value.chain.toLowerCase()}/token/stats`;
      const result = await axios.get<StatsData>(statsUrl);

      if (result.data) {
        totalSupply.value = `${result.data.totalSupply.toLocaleString('en-US')} ${
          chainInfo.value.tokenSymbol
        }`;
        circulatingSupply.value = `${result.data.circulatingSupply.toLocaleString('en-US')} ${
          chainInfo.value.tokenSymbol
        }`;
      }
    };

    loadStats();

    watch([chainInfo], async () => {
      try {
        if (chainInfo.value) {
          await loadStats();
        }
      } catch (error) {
        console.error(error);
      }
    });

    return {
      chainInfo,
      totalSupply,
      circulatingSupply,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';
</style>

<template>
  <div class="wrapper--charts">
    <div class="container--chart-panels">
      <div class="container--value-panel">
        <div class="container--panel">
          <value-panel title="Current Circulating Supply" :value="circulatingSupply" />
        </div>
        <div class="container--panel">
          <value-panel title="Total Supply" :value="totalSupply" />
        </div>
      </div>
      <div class="container--panel">
        <block-panel />
      </div>
      <div v-if="isMainnet" class="container--charts">
        <tvl-chart
          :title="textChart.tvl.title"
          :tooltip="textChart.tvl.tooltip"
          :tvl-value="mergedTvlAmount"
          :tvl-data="filteredMergedTvl"
          :handle-filter-changed="handleMergedTvlFilterChanged"
        />
        <!-- <total-transactions-chart :network="chainInfo.chain" /> -->
        <tvl-chart
          :title="textChart.dappStaking.title"
          :tooltip="textChart.dappStaking.tooltip"
          :tvl-value="dappStakingTvlAmount"
          :tvl-data="filteredDappStakingTvl.dappStaking"
          :merged-tvl-data="filteredDappStakingTvl.merged"
          :handle-filter-changed="handleDappStakingTvlFilterChanged"
          :is-multiple-line="true"
          :second-value="lenStakers"
        />

        <tvl-chart
          :title="textChart.ecosystem.title"
          :tooltip="textChart.ecosystem.tooltip"
          :tvl-value="ecosystemTvlAmount"
          :tvl-data="filteredEcosystemTvl.ecosystem"
          :merged-tvl-data="filteredEcosystemTvl.merged"
          :handle-filter-changed="handleEcosystemTvlFilterChanged"
          :is-multiple-line="true"
        />
        <token-price-chart :network="chainInfo.chain" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import BlockPanel from 'src/components/dashboard/BlockPanel.vue';
import TokenPriceChart from 'src/components/dashboard/TokenPriceChart.vue';
// import TotalTransactionsChart from 'src/components/dashboard/TotalTransactionsChart.vue';
import TvlChart from 'src/components/dashboard/TvlChart.vue';
import ValuePanel from 'src/components/dashboard/ValuePanel.vue';
import { useTvlHistorical } from 'src/hooks';
import { textChart, TOKEN_API_URL } from 'src/modules/token-api';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch } from 'vue';

interface StatsData {
  generatedAt: number;
  totalSupply: number;
  circulatingSupply: number;
}

export default defineComponent({
  components: {
    TokenPriceChart,
    TvlChart,
    BlockPanel,
    // TotalTransactionsChart,
    ValuePanel,
  },
  setup() {
    const store = useStore();
    const totalSupply = ref<string>('');
    const circulatingSupply = ref<string>('');

    const {
      filteredDappStakingTvl,
      filteredEcosystemTvl,
      dappStakingTvlAmount,
      ecosystemTvlAmount,
      handleDappStakingTvlFilterChanged,
      handleEcosystemTvlFilterChanged,
      handleMergedTvlFilterChanged,
      filteredMergedTvl,
      mergedTvlAmount,
      lenStakers,
    } = useTvlHistorical();

    const chainInfo = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo : {};
    });

    const isMainnet = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.chain !== 'Shibuya Testnet' : false;
    });

    const loadStats = async () => {
      if (!chainInfo.value || !chainInfo.value.chain) return;

      const statsUrl = `${TOKEN_API_URL}/v1/${chainInfo.value.chain.toLowerCase()}/token/stats`;
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
      textChart,
      chainInfo,
      totalSupply,
      circulatingSupply,
      isMainnet,
      filteredDappStakingTvl,
      filteredEcosystemTvl,
      dappStakingTvlAmount,
      ecosystemTvlAmount,
      handleDappStakingTvlFilterChanged,
      handleEcosystemTvlFilterChanged,
      handleMergedTvlFilterChanged,
      filteredMergedTvl,
      mergedTvlAmount,
      lenStakers,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';
</style>

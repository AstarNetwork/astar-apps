<template>
  <div class="wrapper--charts">
    <div class="container--chart-panels">
      <div class="container--value-panel">
        <div class="container--panel">
          <circulating-panel :symbol="chainInfo.tokenSymbol" />
        </div>
        <div class="container--panel">
          <rewards-panel :symbol="chainInfo.tokenSymbol" />
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
import BlockPanel from 'src/components/dashboard/BlockPanel.vue';
import CirculatingPanel from 'src/components/dashboard/CirculatingPanel.vue';
import RewardsPanel from 'src/components/dashboard/RewardsPanel.vue';
import TokenPriceChart from 'src/components/dashboard/TokenPriceChart.vue';
// import TotalTransactionsChart from 'src/components/dashboard/TotalTransactionsChart.vue';
import TvlChart from 'src/components/dashboard/TvlChart.vue';
import { useTvlHistorical } from 'src/hooks';
import { textChart } from 'src/modules/token-api';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  components: {
    TokenPriceChart,
    TvlChart,
    BlockPanel,
    CirculatingPanel,
    RewardsPanel,
    // TotalTransactionsChart,
  },
  setup() {
    const store = useStore();
    const totalSupply = ref<number>(0);
    const circulatingSupply = ref<number>(0);

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

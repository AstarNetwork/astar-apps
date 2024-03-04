<template>
  <div class="wrapper--charts">
    <div class="container--chart-panels">
      <div class="container--value-panels-row">
        <div class="container--network-status">
          <network-status />
        </div>
        <div class="container--panel">
          <circulating-panel :symbol="nativeTokenSymbol" :network="currentNetworkName" />
        </div>
      </div>
      <div class="container--value-panels-row row-gap">
        <div class="container--panel">
          <value-panel title="Holders" :value="holders" />
        </div>
        <div class="container--panel">
          <collators />
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
          :tvl-value="dappStakingTvlTokensDisplay"
          :tvl-value-add-on="dappStakingTvlAmountDisplay"
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
        <token-price-chart :network="currentNetworkName" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BlockPanel from 'src/components/dashboard/BlockPanel.vue';
import CirculatingPanel from 'src/components/dashboard/CirculatingPanel.vue';
import ValuePanel from 'src/components/dashboard/ValuePanel.vue';
import Collators from 'src/components/dashboard/Collators.vue';
import NetworkStatus from 'src/components/dashboard/NetworkStatus.vue';
import TokenPriceChart from 'src/components/dashboard/TokenPriceChart.vue';
// import TotalTransactionsChart from 'src/components/dashboard/TotalTransactionsChart.vue';
import { useDataCalculations } from 'src/staking-v3/hooks';
import TvlChart from 'src/components/dashboard/TvlChart.vue';
import { useNetworkInfo, useTvlHistorical } from 'src/hooks';
import { textChart } from 'src/modules/token-api';
import { defineComponent, ref, watchEffect, computed } from 'vue';
import axios from 'axios';
import { TOKEN_API_URL } from '@astar-network/astar-sdk-core';
export default defineComponent({
  components: {
    TokenPriceChart,
    TvlChart,
    BlockPanel,
    CirculatingPanel,
    ValuePanel,
    NetworkStatus,
    Collators,
    // TotalTransactionsChart,
  },
  setup() {
    const holders = ref<string>('');
    const {
      filteredDappStakingTvl,
      filteredEcosystemTvl,
      dappStakingTvlAmount,
      dappStakingTvlTokens,
      ecosystemTvlAmount,
      handleDappStakingTvlFilterChanged,
      handleEcosystemTvlFilterChanged,
      handleMergedTvlFilterChanged,
      filteredMergedTvl,
      mergedTvlAmount,
    } = useTvlHistorical();

    const { numberOfStakersAndLockers } = useDataCalculations();
    const lenStakers = computed(
      () => `${numberOfStakersAndLockers.value.stakersCount.toLocaleString('en-US')} stakers`
    );

    const dappStakingTvlTokensDisplay = computed(
      () => `${dappStakingTvlTokens.value} ${nativeTokenSymbol.value}`
    );
    const dappStakingTvlAmountDisplay = computed(() => `(${dappStakingTvlAmount.value})`);
    const { isMainnet, currentNetworkName, nativeTokenSymbol } = useNetworkInfo();
    const loadStats = async (network: string) => {
      if (!network) return;
      const statsUrl = `${TOKEN_API_URL}/v1/${network}/token/holders`;
      const result = await axios.get<number>(statsUrl);
      if (result.data) {
        holders.value = `${result.data.toLocaleString('en-US')}`;
      }
    };
    watchEffect(async () => {
      try {
        if (currentNetworkName.value) {
          await loadStats(currentNetworkName.value.toLowerCase());
        }
      } catch (error) {
        console.error(error);
      }
    });
    return {
      textChart,
      nativeTokenSymbol,
      currentNetworkName,
      holders,
      isMainnet,
      filteredDappStakingTvl,
      filteredEcosystemTvl,
      dappStakingTvlAmountDisplay,
      dappStakingTvlTokensDisplay,
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
@use 'src/components/dashboard/styles/dashboard.scss';
</style>

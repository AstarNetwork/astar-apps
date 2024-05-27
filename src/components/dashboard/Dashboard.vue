<template>
  <div class="wrapper--charts">
    <div class="container--chart-panels">
      <network-status class="container--component" />

      <div class="container--component">
        <div class="container--title--large">
          {{ `\$${nativeTokenSymbol.toUpperCase()}` }}
        </div>
        <div class="tokenomics">
          <div class="tokenomics-panel">
            <block-panel />
            <circulating-panel :symbol="dappStakingCurrency" :network="currentNetworkName" />
          </div>
          <div class="tokenomics-panel">
            <inflation :symbol="dappStakingCurrency" :network="currentNetworkName" />
            <inflation-rate-chart />
          </div>
        </div>
      </div>
      <div v-if="isMainnet" class="container--charts">
        <tvl-chart
          :title="textChart.tvl.title"
          :tooltip="textChart.tvl.tooltip"
          :tvl-value="mergedTvlAmount"
          :tvl-data="filteredMergedTvl"
          :handle-filter-changed="handleMergedTvlFilterChanged"
          class="container--component"
        />
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
          class="container--component"
        />

        <tvl-chart
          :title="textChart.ecosystem.title"
          :tooltip="textChart.ecosystem.tooltip"
          :tvl-value="ecosystemTvlAmount"
          :tvl-data="filteredEcosystemTvl.ecosystem"
          :merged-tvl-data="filteredEcosystemTvl.merged"
          :handle-filter-changed="handleEcosystemTvlFilterChanged"
          :is-multiple-line="true"
          class="container--component"
        />
        <token-price-chart :network="currentNetworkName" class="container--component" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BlockPanel from 'src/components/dashboard/BlockPanel.vue';
import CirculatingPanel from 'src/components/dashboard/CirculatingPanel.vue';
import NetworkStatus from 'src/components/dashboard/NetworkStatus.vue';
import TokenPriceChart from 'src/components/dashboard/TokenPriceChart.vue';
import Inflation from './Inflation.vue';
import InflationRateChart from './InflationRateChart.vue';
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
    NetworkStatus,
    Inflation,
    InflationRateChart,
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
    const { isMainnet, currentNetworkName, nativeTokenSymbol, dappStakingCurrency } =
      useNetworkInfo();
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
      dappStakingCurrency,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/dashboard.scss';
@use 'src/components/dashboard/styles/common.scss';
</style>

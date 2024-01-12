<template>
  <div v-if="transactions.length > 0" class="wrapper--dapp-stats-charts">
    <div v-if="isDisplayCharts" class="row--stats-title">
      {{ $t('dappStaking.dappPage.stats') }}
    </div>
    <div class="container--charts">
      <stats-chart
        :stats-details="uaw"
        stats-type="uniqueActiveUsers"
        @setIsDisplayCharts="setIsDisplayCharts"
      />
      <stats-chart
        :stats-details="transactions"
        stats-type="numberOfCalls"
        @setIsDisplayCharts="setIsDisplayCharts"
      />
    </div>
  </div>
</template>
<script lang="ts">
import StatsChart from './StatsChart.vue';
import { useNetworkInfo } from 'src/hooks';
import { defineComponent, PropType, ref, watchEffect } from 'vue';
import { StatsDetail, fetchDappTransactions, fetchDappUAW } from '@astar-network/astar-sdk-core';
import { DappCombinedInfo } from 'src/v2/models';

export default defineComponent({
  components: {
    StatsChart,
  },
  props: {
    dapp: {
      type: Object as PropType<DappCombinedInfo>,
      required: true,
    },
  },
  setup(props) {
    const { currentNetworkName } = useNetworkInfo();
    const transactions = ref<StatsDetail[]>([]);
    const uaw = ref<StatsDetail[]>([]);
    const isDisplayCharts = ref<boolean>(false);

    const setIsDisplayCharts = (result: boolean): void => {
      isDisplayCharts.value = result;
    };

    const fetchStatsData = async (): Promise<void> => {
      try {
        if (!currentNetworkName.value || !props.dapp.dapp) return;
        transactions.value = await fetchDappTransactions({
          network: currentNetworkName.value.toLowerCase(),
          dapp: props.dapp.dapp,
        });

        uaw.value = await fetchDappUAW({
          network: currentNetworkName.value.toLowerCase(),
          dapp: props.dapp.dapp,
        });
      } catch (error) {
        console.error(error);
      }
    };

    watchEffect(fetchStatsData);

    return { transactions, uaw, setIsDisplayCharts, isDisplayCharts };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapp-stats-charts.scss';
</style>

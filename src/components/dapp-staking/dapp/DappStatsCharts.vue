<template>
  <div v-if="statsDetails.length > 0" class="wrapper--dapp-stats-charts">
    <div v-if="isDisplayCharts" class="row--stats-title">
      <span class="text--xl text--color"> {{ $t('dappStaking.dappPage.stats') }}</span>
    </div>
    <div class="container--charts">
      <stats-chart
        :stats-details="statsDetails"
        stats-type="uniqueActiveUsers"
        @setIsDisplayCharts="setIsDisplayCharts"
      />
      <stats-chart
        :stats-details="statsDetails"
        stats-type="numberOfCalls"
        @setIsDisplayCharts="setIsDisplayCharts"
      />
    </div>
  </div>
</template>
<script lang="ts">
import StatsChart from 'src/components/dapp-staking/dapp/StatsChart.vue';
import { useNetworkInfo } from 'src/hooks';
import { fetchDappsStats, StatsDetail } from 'src/modules/token-api';
import { DappCombinedInfo } from 'src/v2/models';
import { defineComponent, PropType, ref, watchEffect } from 'vue';

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
    const statsDetails = ref<StatsDetail[]>([]);
    const isDisplayCharts = ref<boolean>(false);

    const setIsDisplayCharts = (result: boolean): void => {
      isDisplayCharts.value = result;
    };

    const fetchStatsData = async (): Promise<void> => {
      try {
        if (!currentNetworkName.value || !props.dapp.contract) return;
        statsDetails.value = await fetchDappsStats({
          network: currentNetworkName.value.toLowerCase(),
          dapp: props.dapp.contract.address,
        });
      } catch (error) {
        console.error(error);
      }
    };

    watchEffect(fetchStatsData);

    return { statsDetails, setIsDisplayCharts, isDisplayCharts };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp-stats-charts.scss';
</style>

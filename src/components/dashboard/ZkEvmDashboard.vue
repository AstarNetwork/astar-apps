<template>
  <div class="wrapper--charts">
    <div class="container--chart-panels">
      <div class="container--value-panels-row">
        <div class="container--network-status">
          <zk-evm-network-status />
          <burn :symbol="dappStakingCurrency" />
        </div>
        <div class="container--panel">
          <circulating-panel :symbol="dappStakingCurrency" :network="currentNetworkName" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import CirculatingPanel from 'src/components/dashboard/CirculatingPanel.vue';
import ZkEvmNetworkStatus from 'src/components/dashboard/ZkEvmNetworkStatus.vue';
import Burn from 'src/components/dashboard/Burn.vue';
import { useNetworkInfo } from 'src/hooks';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    CirculatingPanel,
    ZkEvmNetworkStatus,
    Burn,
  },
  setup() {
    const { currentNetworkName, dappStakingCurrency } = useNetworkInfo();

    return {
      currentNetworkName,
      dappStakingCurrency,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/dashboard.scss';
</style>

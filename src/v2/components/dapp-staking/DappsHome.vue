<template>
  <div>
    <h2>Hello from Dapps Staking v2</h2>
    <dapps-list tag="DeFi" />
    <dapps-list tag="NFT" />
    <dapps-list tag="Games" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'src/store';
import { useNetworkInfo } from 'src/hooks';
import DappsList from 'src/v2/components/dapp-staking/DappsList.vue';

export default defineComponent({
  components: {
    DappsList,
  },
  setup() {
    const store = useStore();
    const { currentNetworkName } = useNetworkInfo();

    store.dispatch('dapps/getDapps', 'astar');
  },
});
</script>

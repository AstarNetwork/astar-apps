<template>
  <div>
    <home-header />
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
import HomeHeader from 'src/v2/components/dapp-staking/HomeHeader.vue';
import { container } from 'src/v2/common';
import { IEventAggregator, NewEraMessage } from 'src/v2/messaging';
import { Symbols } from 'src/v2/symbols';

export default defineComponent({
  components: {
    DappsList,
    HomeHeader,
  },
  setup() {
    const store = useStore();
    const { currentNetworkName } = useNetworkInfo();

    store.dispatch('dapps/getDapps', 'astar');
  },
});
</script>

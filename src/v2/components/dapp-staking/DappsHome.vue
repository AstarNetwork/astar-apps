<template>
  <div>
    <home-header />
    <dapps-list tag="DeFi" />
    <dapps-list tag="NFT" />
    <dapps-list tag="Games" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from 'src/store';
import { ChainInfo } from 'src/hooks';
import DappsList from 'src/v2/components/dapp-staking/DappsList.vue';
import HomeHeader from 'src/v2/components/dapp-staking/HomeHeader.vue';

export default defineComponent({
  components: {
    DappsList,
    HomeHeader,
  },
  setup() {
    const store = useStore();

    const chainInfo = computed<ChainInfo>(() => store.getters['general/chainInfo']);
    store.dispatch('dapps/getDapps', 'astar');
    store.dispatch('dapps/getTvl');
  },
});
</script>

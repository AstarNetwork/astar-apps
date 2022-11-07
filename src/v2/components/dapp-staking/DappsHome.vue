<template>
  <div>
    <home-header />
    <dapps-list tag="DeFi" />
    <dapps-list tag="NFT" />
    <dapps-list tag="Games" />
  </div>
</template>

<script lang="ts">
import { useAccount, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import DappsList from 'src/v2/components/dapp-staking/DappsList.vue';
import HomeHeader from 'src/v2/components/dapp-staking/HomeHeader.vue';
import { defineComponent, watchEffect } from 'vue';

export default defineComponent({
  components: {
    DappsList,
    HomeHeader,
  },
  setup() {
    const store = useStore();

    const { currentNetworkName } = useNetworkInfo();
    const { currentAccount } = useAccount();
    watchEffect(() => {
      if (!currentNetworkName.value || !currentAccount.value) return;
      store.dispatch('dapps/getDapps', {
        network: currentNetworkName.value.toLowerCase(),
        currentAccount: currentAccount.value ? currentAccount.value : '',
      });
    });
    store.dispatch('dapps/getTvl');
  },
});
</script>

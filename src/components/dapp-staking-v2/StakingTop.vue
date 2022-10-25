<template>
  <div class="wrapper-main">
    <TopMetric />

    <div class="divider"></div>

    <!-- <MyStaking /> -->

    <div class="divider"></div>

    <DappList category="DeFi" />

    <AdsArea />

    <div class="divider"></div>

    <DappList category="NFT" />

    <div class="divider"></div>

    <DappList category="Games" />
  </div>
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import TopMetric from 'src/components/dapp-staking-v2/my-staking/TopMetric.vue';
import MyStaking from 'src/components/dapp-staking-v2/my-staking/MyStaking.vue';
import DappList from 'src/components/dapp-staking-v2/my-staking/DappList.vue';
import { computed, defineComponent, watchEffect } from 'vue';
import AdsArea from './my-staking/AdsArea.vue';

export default defineComponent({
  components: {
    TopMetric,
    // MyStaking,
    DappList,
    AdsArea,
  },
  setup() {
    useMeta({ title: 'Discover dApps' });
    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

    const { currentNetworkName } = useNetworkInfo();
    const { currentAccount } = useAccount();
    watchEffect(() => {
      if (!currentNetworkName.value) return;
      store.dispatch('dapps/getDapps', {
        network: currentNetworkName.value.toLowerCase(),
        currentAccount: currentAccount.value ? currentAccount.value : '',
      });
    });
    store.dispatch('dapps/getTvl');

    return {
      isLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper-main {
  padding: 0px 0px 24px 0px;
  margin: 0 auto;

  @media (min-width: $md) {
    max-width: $md;
  }

  @media (min-width: $lg) {
    max-width: $lg;
  }
}

.divider {
  border-top: 1px solid $object-light;
  margin-top: 24px;
  margin-bottom: 24px;
}

.body--dark {
  .divider {
    border-color: $gray-5;
  }
}
</style>

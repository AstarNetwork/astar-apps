<template>
  <div v-if="isReady" class="wrapper-main">
    <top-metric />
    <register />
    <banner-area />

    <div class="divider" />
    <my-staking />

    <div class="divider" />
    <dapp-list category="DeFi" />
    <ads-area />

    <div class="divider" />
    <dapp-list category="NFT" />

    <div class="divider" />
    <dapp-list category="Tooling" />

    <div class="divider" />
    <dapp-list category="Utility" />

    <div class="divider" />
    <dapp-list category="Others" />
  </div>
  <div v-else />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { useAccount, useNetworkInfo, usePageReady } from 'src/hooks';
import { useStore } from 'src/store';
import TopMetric from 'src/components/dapp-staking-v2/my-staking/TopMetric.vue';
import MyStaking from 'src/components/dapp-staking-v2/my-staking/MyStaking.vue';
import DappList from 'src/components/dapp-staking-v2/my-staking/DappList.vue';
import Register from 'src/components/dapp-staking-v2/my-staking/Register.vue';
import { computed, defineComponent, watchEffect } from 'vue';
import AdsArea from './my-staking/AdsArea.vue';
import BannerArea from './my-staking/BannerArea.vue';

export default defineComponent({
  components: {
    TopMetric,
    MyStaking,
    DappList,
    AdsArea,
    Register,
    BannerArea,
  },
  setup() {
    useMeta({ title: 'Discover dApps' });
    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const { isReady } = usePageReady();

    const { currentNetworkName } = useNetworkInfo();
    const { currentAccount } = useAccount();

    watchEffect(() => {
      if (!currentNetworkName.value) return;
      store.dispatch('dapps/getDapps', {
        network: currentNetworkName.value.toLowerCase(),
        currentAccount: currentAccount.value ? currentAccount.value : '',
      });
    });

    watchEffect(() => {
      store.dispatch('dapps/getTvl');
    });

    return {
      isLoading,
      isReady,
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
    max-width: 720px;
  }

  @media (min-width: $widthCardLineUp) {
    max-width: 100%;
  }
  @media (min-width: $lg) {
    margin-top: 48px;
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

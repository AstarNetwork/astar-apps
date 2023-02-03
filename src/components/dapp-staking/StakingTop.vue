<template>
  <div v-if="isReady" class="extra-wrapper">
    <div class="container--main">
      <top-metric />
      <register />
      <dynamic-ads-area />

      <div class="divider" />
      <my-staking />
      <div class="divider" />
      <on-chain-data />
      <dapp-list category="DeFi" />

      <q-intersection transition="fade" transition-duration="1000" once>
        <ads-area />
      </q-intersection>

      <dapp-list category="NFT" />
      <dapp-list category="Tooling" />
      <dapp-list category="Utility" />
      <dapp-list category="Others" />
    </div>
  </div>
  <div v-else />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { useDispatchGetDapps, usePageReady } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, defineComponent, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import DappList from './my-staking/DappList.vue';
import MyStaking from './my-staking/MyStaking.vue';
import Register from './my-staking/Register.vue';
import OnChainData from './my-staking/OnChainData.vue';
import TopMetric from './my-staking/TopMetric.vue';
import AdsArea from './my-staking/AdsArea.vue';
import DynamicAdsArea from './my-staking/DynamicAdsArea.vue';

export default defineComponent({
  components: {
    TopMetric,
    MyStaking,
    DappList,
    AdsArea,
    Register,
    DynamicAdsArea,
    OnChainData,
  },
  setup() {
    useMeta({ title: 'Discover dApps' });
    const store = useStore();
    const { isReady } = usePageReady();
    useDispatchGetDapps();

    const { t } = useI18n();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const dapps = computed(() => store.getters['dapps/getAllDapps']);

    const handlePageLoading = (): void => {
      const isLoad = dapps.value.length === 0;
      store.commit('general/setLoading', isLoad);
    };

    watch(
      [isH160],
      () => {
        if (isH160.value) {
          store.dispatch('general/showAlertMsg', {
            msg: t('dappStaking.error.onlySupportsSubstrate'),
            alertType: 'error',
          });
        }
      },
      { immediate: true }
    );

    watch(
      [dapps],
      () => {
        handlePageLoading();
      },
      { immediate: true }
    );

    watchEffect(() => {
      store.dispatch('dapps/getTvl');
    });

    return { isReady };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.extra-wrapper {
  max-width: 1300px;
  margin: 0 auto;
}

.container--main {
  width: 100%;
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

<template>
  <div v-if="isReady" class="extra-wrapper">
    <div class="container--main">
      <top-metric />
      <register />
      <dynamic-ads-area />

      <div v-if="!isZkEvm" class="container--divider">
        <div class="divider" />
      </div>
      <my-staking v-if="!isZkEvm" />
      <div v-if="!isZkEvm" class="container--divider">
        <div class="divider" />
      </div>
      <on-chain-data />
      <dapp-list category="DeFi" />

      <q-intersection transition="fade" transition-duration="1000" once>
        <ads-area />
      </q-intersection>

      <dapp-list category="NFT" />
      <dapp-list category="Tooling" />
      <dapp-list category="Utility" />
      <dapp-list category="Others" />
      <dapp-list category="unstoppable-grants" />
    </div>

    <Teleport to="#staking-top-bg">
      <div
        class="dapps-staking-bg"
        :style="{ backgroundImage: `url(${isDarkTheme ? bg_img.dark : bg_img.light})` }"
      />
    </Teleport>
  </div>
  <div v-else />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { useDispatchGetDapps, useNetworkInfo, usePageReady } from 'src/hooks';
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
import { generateMeta } from 'src/config/metadata';
import { Path } from 'src/router';

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
    useMeta(generateMeta(Path.Discover));
    const store = useStore();
    const { isReady } = usePageReady();
    const { t } = useI18n();
    useDispatchGetDapps();

    const { isZkEvm } = useNetworkInfo();
    const dapps = computed(() => store.getters['dapps/getAllDapps']);

    const handlePageLoading = (): void => {
      const isLoad = dapps.value.length === 0;
      store.commit('general/setLoading', isLoad);
    };

    watch(
      [isZkEvm],
      () => {
        if (isZkEvm.value) {
          store.dispatch('general/showAlertMsg', {
            msg: t('dappStaking.error.notSupportZkEvm'),
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

    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');
    const bg_img = {
      light: require('/src/assets/img/dapps_staking_bg_light.webp'),
      dark: require('/src/assets/img/dapps_staking_bg_dark.webp'),
    };

    return { isReady, isZkEvm, isDarkTheme, bg_img };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.extra-wrapper {
  max-width: $container-max-width;
  margin: 0 auto;
  z-index: 1;
  position: relative;
}

.container--main {
  width: 100%;
  padding: 48px 0 24px 0px;
  margin: 0 auto;

  @media (min-width: $md) {
    max-width: 720px;
  }

  @media (min-width: $widthCardLineUp) {
    max-width: 100%;
  }
}

.divider {
  border-top: 1px solid transparent;
  border-image: linear-gradient(
    121.48deg,
    #e6007a -5.77%,
    #703ac2 13.57%,
    #0070eb 34.18%,
    #0297fb 58.08%,
    #0ae2ff 74.93%
  );
  border-image-slice: 1;
  margin-top: 80px;
  margin-bottom: 24px;
}

.container--divider {
  padding: 0 16px;
  @media (min-width: $lg) {
    padding: 0;
  }
}

.body--dark {
  .divider {
    border-color: $gray-5;
  }
}
</style>

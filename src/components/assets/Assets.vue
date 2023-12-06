<template>
  <div v-if="xcmAssets.assets.length > 0 || !isLoading" class="wrapper--assets">
    <div class="assets-page-bg" :style="{ backgroundImage: `url(${bg})` }" />
    <div class="container--assets">
      <div class="column--main">
        <account
          :ttl-erc20-amount="evmAssets.ttlEvmUsdAmount"
          :ttl-native-xcm-usd-amount="ttlNativeXcmUsdAmount"
          :is-loading-erc20-amount="isLoading"
          :is-loading-xcm-assets-amount="isLoadingXcmAssetsAmount"
        />

        <div v-if="isDappStakingV3">
          <your-project />
        </div>

        <div v-if="isH160" class="container">
          <evm-asset-list :tokens="evmAssets.assets" />
        </div>

        <template v-else>
          <div v-if="isEnableXcm" class="container">
            <xcm-native-asset-list :xcm-assets="xcmAssets.assets" />
          </div>
        </template>

        <div v-if="isDappStakingV3">
          <staking />
        </div>
      </div>

      <div class="column--links">
        <side-ads />
        <astar-domains />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import Account from 'src/components/assets/Account.vue';
import EvmAssetList from 'src/components/assets/EvmAssetList.vue';
import SideAds from 'src/components/assets/SideAds.vue';
import XcmNativeAssetList from 'src/components/assets/XcmNativeAssetList.vue';
import YourProject from 'src/components/assets/YourProject.vue';
import AstarDomains from 'src/components/header/mobile/AstarDomains.vue';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useAccount, useBalance, useDispatchGetDapps, useNetworkInfo } from 'src/hooks';
import { useDappStaking } from 'src/staking-v3';
import { useStore } from 'src/store';
import { EvmAssets, XcmAssets, XvmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, onUnmounted, ref, watch, watchEffect } from 'vue';
import Staking from 'src/staking-v3/components/my-staking/Staking.vue';

export default defineComponent({
  components: {
    Account,
    SideAds,
    AstarDomains,
    EvmAssetList,
    XcmNativeAssetList,
    YourProject,
    Staking,
  },
  setup() {
    const token = ref<Asset | null>(null);
    const isModalXcmBridge = ref<boolean>(false);
    const isModalXcmTransfer = ref<boolean>(false);
    const { isDappStakingV3 } = useDappStaking();

    const store = useStore();
    const { currentAccount } = useAccount();

    const { accountData } = useBalance(currentAccount);
    const { isMainnet, currentNetworkIdx, evmNetworkIdx, isZkEvm } = useNetworkInfo();
    // Memo: load the dApps data in advance, so that users can access to dApp staging page smoothly
    useDispatchGetDapps();

    const evmNetworkId = computed(() => {
      return Number(providerEndpoints[currentNetworkIdx.value].evmChainId);
    });
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
    const xvmAssets = computed<XvmAssets>(() => store.getters['assets/getAllXvmAssets']);
    const ttlNativeXcmUsdAmount = computed<number>(() => xcmAssets.value.ttlNativeXcmUsdAmount);
    const evmAssets = computed<EvmAssets>(() => store.getters['assets/getEvmAllAssets']);

    const isLoadingXcmAssetsAmount = computed<boolean>(() => {
      if (isMainnet.value) {
        return !xcmAssets.value.assets.length;
      } else {
        return false;
      }
    });

    const handleUpdateNativeTokenAssets = () => {
      if (currentAccount.value && evmNetworkIdx.value) {
        store.dispatch('assets/getAssets', { address: currentAccount.value, isFetchUsd: true });
        !isH160.value &&
          store.dispatch('assets/getXvmAssets', {
            currentAccount: currentAccount.value,
            isFetchUsd: isMainnet.value,
            srcChainId: evmNetworkIdx.value,
          });
      }
    };

    const handleUpdateEvmAssets = (): void => {
      currentAccount.value &&
        isValidEvmAddress(currentAccount.value) &&
        store.dispatch('assets/getEvmAssets', {
          currentAccount: currentAccount.value,
          srcChainId: evmNetworkId.value,
          currentNetworkIdx: currentNetworkIdx.value,
          isFetchUsd: isMainnet.value,
        });
      return;
    };

    const handleUpdateXvmAssets = (): void => {
      currentAccount.value &&
        store.dispatch('assets/getXvmAssets', {
          currentAccount: currentAccount.value,
          isFetchUsd: isMainnet.value,
          srcChainId: evmNetworkIdx.value,
        });
      return;
    };

    const getAssetEventAndHandler = (): {
      event: LOCAL_STORAGE;
      handler: () => void;
    } => {
      const event = isH160.value
        ? LOCAL_STORAGE.EVM_TOKEN_IMPORTS
        : LOCAL_STORAGE.XVM_TOKEN_IMPORTS;
      const handler = isH160.value ? handleUpdateEvmAssets : handleUpdateXvmAssets;
      return { event, handler };
    };

    // Memo: triggered after users have imported custom ERC20/XVM tokens
    const handleImportingCustomToken = (): void => {
      const { handler, event } = getAssetEventAndHandler();
      window.addEventListener(event, handler);
    };

    watch([currentAccount, evmNetworkIdx], handleUpdateNativeTokenAssets, { immediate: true });
    watch([currentAccount], handleUpdateEvmAssets, { immediate: isH160.value });
    watchEffect(handleImportingCustomToken);

    const isEnableXcm = computed(
      () => !isZkEvm.value && xcmAssets.value.assets && xcmAssets.value.assets.length > 0
    );

    const handleEvmAssetLoader = (): void => {
      if (isMainnet.value && isH160.value) {
        const isAssets = evmAssets.value.assets.length > 0;
        store.commit('general/setLoading', !isAssets);
      }
    };

    watch([evmAssets, xcmAssets, isH160, isMainnet], handleEvmAssetLoader, { immediate: true });

    onUnmounted(() => {
      const { handler, event } = getAssetEventAndHandler();
      window.removeEventListener(event, handler);
    });

    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');

    const bg_img = {
      light: require('/src/assets/img/assets_bg_light.webp'),
      dark: require('/src/assets/img/assets_bg_dark_A.webp'),
    };

    const bg = computed<String>(() => {
      if (isDarkTheme.value) {
        return bg_img.dark;
      }
      return bg_img.light;
    });

    return {
      evmAssets,
      isLoadingXcmAssetsAmount,
      isH160,
      isEnableXcm,
      xcmAssets,
      xvmAssets,
      ttlNativeXcmUsdAmount,
      isModalXcmTransfer,
      token,
      accountData,
      isModalXcmBridge,
      isLoading,
      bg,
      isDappStakingV3,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>

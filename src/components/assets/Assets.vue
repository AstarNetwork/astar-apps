<template>
  <div v-if="!isLoading" class="wrapper--assets">
    <div class="bg--assets">
      <img class="bg--assets__stars" :src="bg_img.astar_stars" />
    </div>

    <div class="wrapper--assets__inner">
      <div class="container--assets">
        <div class="container--account">
          <account
            :ttl-erc20-amount="evmAssets.ttlEvmUsdAmount"
            :ttl-native-xcm-usd-amount="ttlNativeXcmUsdAmount"
            :is-loading-erc20-amount="isLoading"
            :is-loading-xcm-assets-amount="isLoadingXcmAssetsAmount"
          />
          <rewards />
        </div>

        <div class="container container--native">
          <evm-native-token v-if="isH160" />
          <native-asset-list v-if="!isH160" />
        </div>

        <div class="container container--others">
          <div v-if="isH160">
            <evm-asset-list :tokens="evmAssets.assets" />
          </div>
          <div v-else>
            <!-- Memo: hide xvm panel because AA might replace it -->
            <!-- <xvm-native-asset-list v-if="isSupportXvmTransfer" :xvm-assets="xvmAssets.xvmAssets" /> -->
            <xcm-native-asset-list v-if="isEnableXcm" :xcm-assets="xcmAssets.assets" />
          </div>
        </div>
      </div>

      <div class="column--links">
        <dynamic-links />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Account from 'src/components/assets/Account.vue';
import Rewards from 'src/components/assets/Rewards.vue';
import DynamicLinks from 'src/components/assets/DynamicLinks.vue';
import EvmAssetList from 'src/components/assets/EvmAssetList.vue';
import XcmNativeAssetList from 'src/components/assets/XcmNativeAssetList.vue';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import { useAccount, useBalance, useDispatchGetDapps, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { EvmAssets, XcmAssets, XvmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, ref, watch, watchEffect, onUnmounted } from 'vue';
import NativeAssetList from 'src/components/assets/NativeAssetList.vue';
import EvmNativeToken from 'src/components/assets/EvmNativeToken.vue';

export default defineComponent({
  components: {
    Account,
    Rewards,
    DynamicLinks,
    EvmAssetList,
    XcmNativeAssetList,
    NativeAssetList,
    EvmNativeToken,
  },
  setup() {
    const token = ref<Asset | null>(null);
    const isModalXcmBridge = ref<boolean>(false);
    const isModalXcmTransfer = ref<boolean>(false);

    const store = useStore();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const { isMainnet, currentNetworkIdx, evmNetworkIdx } = useNetworkInfo();
    // Memo: load the dApps data in advance, so that users can access to dApp staging page smoothly
    useDispatchGetDapps();

    const dapps = computed(() => store.getters['dapps/getAllDapps']);

    const evmNetworkId = computed(() => {
      return Number(providerEndpoints[currentNetworkIdx.value].evmChainId);
    });
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const isShibuya = computed(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

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

    const isEnableXcm = computed<boolean>(
      () => xcmAssets.value.assets && xcmAssets.value.assets.length > 0
    );

    const handleEvmAssetLoader = (): void => {
      if (isMainnet.value && isH160.value) {
        const isAssets = evmAssets.value.assets.length > 0;
        store.commit('general/setLoading', !isAssets);
      }
      const isLoad = dapps.value.length === 0;
      store.commit('general/setLoading', isLoad);
    };

    watch([evmAssets, xcmAssets, isH160, isMainnet, dapps], handleEvmAssetLoader, {
      immediate: true,
    });

    onUnmounted(() => {
      const { handler, event } = getAssetEventAndHandler();
      window.removeEventListener(event, handler);
    });

    const bg_img = {
      astar_stars: require('/src/assets/img/assets-page-bg-stars.webp'),
    };

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
      bg_img,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>

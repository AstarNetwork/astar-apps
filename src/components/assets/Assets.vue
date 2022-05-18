<template>
  <div v-if="selectedAddress && isDisplay" class="wrapper--assets">
    <div class="container--assets">
      <Account
        :ttl-erc20-amount="ttlErc20Amount"
        :ttl-native-xcm-usd-amount="ttlNativeXcmUsdAmount"
        :is-loading-erc20-amount="isLoadingErc20Amount"
        :is-loading-xcm-assets-amount="isLoadingXcmAssetsAmount"
      />
      <div v-if="selectedAddress">
        <div v-if="isH160">
          <EvmAssetList
            :tokens="tokens"
            :handle-update-token-balances="handleUpdateTokenBalances"
          />
        </div>
        <div v-else class="container--assets">
          <NativeAssetList />
          <XcmNativeAssetList
            v-if="isEnableXcm"
            :xcm-assets="xcmAssets"
            :handle-update-xcm-token-balances="handleUpdateXcmTokenBalances"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Account from 'src/components/assets/Account.vue';
import NativeAssetList from 'src/components/assets/NativeAssetList.vue';
import XcmNativeAssetList from 'src/components/assets/XcmNativeAssetList.vue';
import EvmAssetList from 'src/components/assets/EvmAssetList.vue';

import { useStore } from 'src/store';
import { defineComponent, computed, ref, watchEffect } from 'vue';
import { useCbridgeV2, useXcmAssets } from 'src/hooks';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { wait } from 'src/hooks/helper/common';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';

export default defineComponent({
  components: {
    Account,
    NativeAssetList,
    EvmAssetList,
    XcmNativeAssetList,
  },
  setup() {
    const { tokens, isLoadingErc20Amount, ttlErc20Amount, handleUpdateTokenBalances } =
      useCbridgeV2();
    const {
      xcmAssets,
      ttlNativeXcmUsdAmount,
      isLoadingXcmAssetsAmount,
      handleUpdateTokenBalances: handleUpdateXcmTokenBalances,
    } = useXcmAssets();
    const isDisplay = ref<boolean>(false);
    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const currentNetworkIdx = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return getProviderIndex(chain);
    });

    const isEnableXcm = computed(
      () => currentNetworkIdx.value !== endpointKey.SHIBUYA && xcmAssets.value.length > 0
    );

    const setIsDisplay = async (): Promise<void> => {
      const address = localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS);
      const isEthereumExtension = address === 'Ethereum Extension';
      if (!isDisplay.value && isEthereumExtension) {
        // Memo: Wait for update the `isH160` state
        const secDelay = 1 * 1000;
        await wait(secDelay);
        isDisplay.value = true;
      } else {
        isDisplay.value = true;
      }
    };

    watchEffect(() => {
      setIsDisplay();
    });

    return {
      isLoadingErc20Amount,
      isLoadingXcmAssetsAmount,
      selectedAddress,
      isH160,
      tokens,
      ttlErc20Amount,
      isDisplay,
      isEnableXcm,
      xcmAssets,
      ttlNativeXcmUsdAmount,
      handleUpdateXcmTokenBalances,
      handleUpdateTokenBalances,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>

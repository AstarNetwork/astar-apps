<template>
  <div v-if="currentAccount && isDisplay" class="wrapper--assets">
    <div class="container--assets">
      <Account
        :ttl-erc20-amount="ttlErc20Amount"
        :ttl-native-xcm-usd-amount="ttlNativeXcmUsdAmount"
        :is-loading-erc20-amount="isLoadingErc20Amount"
        :is-loading-xcm-assets-amount="isLoadingXcmAssetsAmount"
      />
      <div v-if="currentAccount">
        <div v-if="isH160">
          <EvmAssetList :tokens="tokens" />
        </div>
        <div v-else class="container--assets">
          <XcmNativeAssetList v-if="isEnableXcm" :xcm-assets="xcmAssets.assets" />
          <NativeAssetList />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Account from 'src/components/assets/Account.vue';
import EvmAssetList from 'src/components/assets/EvmAssetList.vue';
import NativeAssetList from 'src/components/assets/NativeAssetList.vue';
import XcmNativeAssetList from 'src/components/assets/XcmNativeAssetList.vue';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useAccount, useBalance, useCbridgeV2, useNetworkInfo } from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';

export default defineComponent({
  components: {
    Account,
    NativeAssetList,
    EvmAssetList,
    XcmNativeAssetList,
  },
  setup() {
    const token = ref<Asset | null>(null);
    const isModalXcmBridge = ref<boolean>(false);
    const isModalXcmTransfer = ref<boolean>(false);
    const isDisplay = ref<boolean>(false);

    // Todo: get the data from global state
    const { tokens, isLoadingErc20Amount, ttlErc20Amount } = useCbridgeV2();
    const store = useStore();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const { isMainnet, currentNetworkIdx } = useNetworkInfo();
    const evmNetworkId = computed(() => {
      return Number(providerEndpoints[currentNetworkIdx.value].evmChainId);
    });
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    const isShibuya = computed(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

    // v2
    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
    const ttlNativeXcmUsdAmount = computed<number>(() => xcmAssets.value.ttlNativeXcmUsdAmount);

    const isLoadingXcmAssetsAmount = computed<boolean>(() => {
      if (isMainnet.value) {
        return !xcmAssets.value.assets.length;
      } else {
        return false;
      }
    });

    const handleUpdateXcmTokenAssets = () => {
      currentAccount.value &&
        store.dispatch('assets/getAssets', { address: currentAccount.value, isFetchUsd: true });
    };

    const handleUpdateEvmAssets = (): void => {
      if (isH160.value) {
        currentAccount.value &&
          store.dispatch('assets/getEvmAssets', {
            currentAccount: currentAccount.value,
            srcChainId: evmNetworkId.value,
            currentNetworkIdx: currentNetworkIdx.value,
            isFetchUsd: true,
          });
      }
    };

    watch([currentAccount], handleUpdateXcmTokenAssets, { immediate: true });
    watch([currentAccount], handleUpdateEvmAssets, { immediate: true });
    // v2 end

    const isEnableXcm = computed(
      () => !isShibuya.value && xcmAssets.value.assets && xcmAssets.value.assets.length > 0
    );

    const setIsDisplay = async (): Promise<void> => {
      const address = localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS);
      const isEthereumExtension = address === 'Ethereum Extension';
      const isLoading = !isShibuya.value && !isEnableXcm.value && isEthereumExtension;

      if (isLoading) {
        isDisplay.value = false;
        // Memo: isEthereumExtension -> loading state is controlled under useCbridgeV2.ts
        isEthereumExtension && store.commit('general/setLoading', true);
        return;
      }

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
      currentAccount,
      isH160,
      tokens,
      ttlErc20Amount,
      isDisplay,
      isEnableXcm,
      xcmAssets,
      ttlNativeXcmUsdAmount,
      isModalXcmTransfer,
      token,
      accountData,
      isModalXcmBridge,
      isLoading,
      handleUpdateXcmTokenAssets,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>

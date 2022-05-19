<template>
  <div v-if="selectedAddress && isDisplay" class="wrapper--assets">
    <div class="container--assets">
      <Account
        :ttl-erc20-amount="ttlErc20Amount"
        :ttl-native-xcm-usd-amount="ttlNativeXcmUsdAmount"
      />
      <div v-if="selectedAddress">
        <div v-if="isH160">
          <EvmAssetList
            :tokens="tokens"
            :handle-update-token-balances="handleUpdateTokenBalances"
          />
        </div>
        <div v-else class="container--assets">
          <XcmNativeAssetList
            v-if="isEnableXcm"
            :xcm-assets="xcmAssets"
            :handle-update-xcm-token-balances="handleUpdateXcmTokenBalances"
          />
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
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useCbridgeV2, useXcmAssets } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  components: {
    Account,
    NativeAssetList,
    EvmAssetList,
    XcmNativeAssetList,
  },
  setup() {
    const { tokens, ttlErc20Amount, handleUpdateTokenBalances } = useCbridgeV2();
    const {
      xcmAssets,
      ttlNativeXcmUsdAmount,
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

    const isShibuya = computed(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

    const isEnableXcm = computed(
      () => !isShibuya.value && xcmAssets.value && xcmAssets.value.length > 0
    );

    const setIsDisplay = async (): Promise<void> => {
      const address = localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS);
      const isEthereumExtension = address === 'Ethereum Extension';
      const isLoading = !isShibuya.value && !isEnableXcm.value;

      if (isLoading) {
        isDisplay.value = false;
        store.commit('general/setLoading', true);
        return;
      } else {
        store.commit('general/setLoading', false);
      }

      if (!isDisplay.value && isEthereumExtension) {
        isDisplay.value = true;
      } else {
        isDisplay.value = true;
      }
    };

    watchEffect(() => {
      setIsDisplay();
    });

    return {
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

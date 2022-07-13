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
            :handle-update-xcm-token-balances="handleUpdateXcmTokenBalances"
            :xcm-assets="xcmAssets"
          />
        </div>
        <div v-else class="container--assets">
          <XcmNativeAssetList
            v-if="isEnableXcm"
            :xcm-assets="xcmAssets"
            :handle-modal-xcm-bridge="handleModalXcmBridge"
            :handle-modal-xcm-transfer="handleModalXcmTransfer"
          />
          <NativeAssetList :handle-modal-xcm-bridge="handleModalXcmBridge" />
        </div>
      </div>
    </div>
    <Teleport to="#app--main">
      <ModalXcmTransfer
        :is-modal-xcm-transfer="isModalXcmTransfer"
        :handle-modal-xcm-transfer="handleModalXcmTransfer"
        :handle-update-xcm-token-balances="handleUpdateXcmTokenBalances"
        :account-data="accountData"
        :token="token"
      />

      <ModalXcmBridge
        :is-modal-xcm-bridge="isModalXcmBridge"
        :handle-modal-xcm-bridge="handleModalXcmBridge"
        :account-data="accountData"
        :token="token"
        :handle-update-xcm-token-balances="handleUpdateXcmTokenBalances"
      />
    </Teleport>
  </div>
</template>
<script lang="ts">
import Account from 'src/components/assets/Account.vue';
import EvmAssetList from 'src/components/assets/EvmAssetList.vue';
import NativeAssetList from 'src/components/assets/NativeAssetList.vue';
import XcmNativeAssetList from 'src/components/assets/XcmNativeAssetList.vue';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { ChainAsset, useBalance, useCbridgeV2, useXcmAssets } from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import ModalXcmBridge from './modals/ModalXcmBridge.vue';
import ModalXcmTransfer from './modals/ModalXcmTransfer.vue';

export default defineComponent({
  components: {
    Account,
    NativeAssetList,
    EvmAssetList,
    XcmNativeAssetList,
    ModalXcmBridge,
    ModalXcmTransfer,
  },
  setup() {
    const token = ref<ChainAsset | null>(null);
    const isModalXcmBridge = ref<boolean>(false);
    const isModalXcmTransfer = ref<boolean>(false);
    const isDisplay = ref<boolean>(false);

    const { tokens, isLoadingErc20Amount, ttlErc20Amount, handleUpdateTokenBalances } =
      useCbridgeV2();
    const {
      ttlNativeXcmUsdAmount,
      isLoadingXcmAssetsAmount,
      handleUpdateTokenBalances: handleUpdateXcmTokenBalances,
    } = useXcmAssets();
    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { accountData } = useBalance(selectedAddress);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const currentNetworkIdx = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return getProviderIndex(chain);
    });

    const isShibuya = computed(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

    // v2
    const xcmAssets = computed(() => store.getters['assets/getAllAssets']);

    watch(
      selectedAddress,
      (newValue) => {
        // TODO investigate why when we use metamask and sett asset to vuex, address is changed in store for some reason
        // and wathcer is called again, whiche ends in infinite loop.
        if (newValue && (!isH160.value || (isH160.value && newValue !== selectedAddress.value))) {
          store.dispatch('assets/getAssets', newValue);
        }
      },
      { immediate: true }
    );
    // v2 end

    const isEnableXcm = computed(
      () => !isShibuya.value && xcmAssets.value && xcmAssets.value.length > 0
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

    const handleModalXcmTransfer = ({
      isOpen,
      currency,
    }: {
      isOpen: boolean;
      currency: ChainAsset;
    }) => {
      isModalXcmTransfer.value = isOpen;
      token.value = currency;
    };

    const handleModalXcmBridge = ({
      isOpen,
      currency,
    }: {
      isOpen: boolean;
      currency: ChainAsset;
    }) => {
      isModalXcmBridge.value = isOpen;
      token.value = currency;
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
      isModalXcmTransfer,
      token,
      accountData,
      isModalXcmBridge,
      handleUpdateXcmTokenBalances,
      handleUpdateTokenBalances,
      handleModalXcmBridge,
      handleModalXcmTransfer,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>

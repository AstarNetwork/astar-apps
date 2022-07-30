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
          <EvmAssetList
            :tokens="tokens"
            :handle-update-token-balances="handleUpdateTokenBalances"
            :handle-modal-xcm-bridge="handleModalXcmBridge"
            :xcm-assets="xcmAssets.assets"
          />
        </div>
        <div v-else class="container--assets">
          <XcmNativeAssetList
            v-if="isEnableXcm"
            :xcm-assets="xcmAssets.assets"
            :handle-modal-xcm-bridge="handleModalXcmBridge"
            :handle-modal-xcm-transfer="handleModalXcmTransfer"
          />
          <NativeAssetList :handle-modal-xcm-bridge="handleModalXcmBridge" />
        </div>
      </div>
    </div>
    <ModalXcmTransfer
      :is-modal-xcm-transfer="isModalXcmTransfer"
      :handle-modal-xcm-transfer="handleModalXcmTransfer"
      :handle-update-xcm-token-balances="handleUpdateXcmTokenAssets"
      :account-data="accountData"
      :token="token"
    />

    <ModalXcmBridge
      :is-modal-xcm-bridge="isModalXcmBridge"
      :handle-modal-xcm-bridge="handleModalXcmBridge"
      :account-data="accountData"
      :token="token"
      :handle-update-xcm-token-balances="handleUpdateXcmTokenAssets"
    />
  </div>
</template>
<script lang="ts">
import Account from 'src/components/assets/Account.vue';
import EvmAssetList from 'src/components/assets/EvmAssetList.vue';
import NativeAssetList from 'src/components/assets/NativeAssetList.vue';
import XcmNativeAssetList from 'src/components/assets/XcmNativeAssetList.vue';
import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useAccount, useBalance, useCbridgeV2, useNetworkInfo } from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { Erc20Token } from 'src/modules/token';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
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
    const token = ref<Asset | null>(null);
    const isModalXcmBridge = ref<boolean>(false);
    const isModalXcmTransfer = ref<boolean>(false);
    const isDisplay = ref<boolean>(false);

    const { tokens, isLoadingErc20Amount, ttlErc20Amount, handleUpdateTokenBalances } =
      useCbridgeV2();
    const store = useStore();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const { isMainnet, currentNetworkIdx } = useNetworkInfo();
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
      if (currentAccount.value) {
        store.dispatch('assets/getAssets', currentAccount.value);
      }
    };

    watch([currentAccount], handleUpdateXcmTokenAssets, { immediate: true });
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

    const handleModalXcmTransfer = ({ isOpen, currency }: { isOpen: boolean; currency: Asset }) => {
      isModalXcmTransfer.value = isOpen;
      token.value = currency;
    };

    const handleModalXcmBridge = ({
      isOpen,
      currency,
    }: {
      isOpen: boolean;
      // Memo: currency type is `Erc20Token` in H160 mode
      currency: Asset | Erc20Token;
    }) => {
      isModalXcmBridge.value = isOpen;
      if (isH160.value) {
        if (currency === null) {
          token.value = null;
        } else {
          const c = currency as Erc20Token;
          const t = xcmAssets.value.assets.find((it) => it.mappedERC20Addr === c.address);
          if (t) {
            token.value = t;
          }
        }
      } else {
        token.value = currency as Asset;
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

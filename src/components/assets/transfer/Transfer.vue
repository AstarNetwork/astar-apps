<template>
  <div>
    <BackToAsset :class="isHighlightRightUi && 'half-opacity'" />
    <MobileNavigator />
    <div class="wrapper--transfer">
      <div class="container--transfer">
        <TransferModeTab
          :is-local-transfer="isLocalTransfer"
          :set-is-local-transfer="setIsLocalTransfer"
          :is-disabled-xcm="isShibuya"
          :class="isHighlightRightUi && 'half-opacity'"
        />
        <div class="wrapper-containers">
          <div v-if="isLocalTransfer">
            <LocalTransfer
              v-if="isTransferNativeToken"
              :account-data="accountData"
              :class="isHighlightRightUi && 'half-opacity'"
              :symbol="token ? token.metadata.symbol : 'ASTR'"
              :handle-finalized-callback="handleFinalizedCallback"
            />
            <LocalXcmTransfer
              v-else
              :account-data="accountData"
              :class="isHighlightRightUi && 'half-opacity'"
              :symbol="token ? token.metadata.symbol : 'ASTR'"
              :token="token"
              :handle-finalized-callback="handleFinalizedCallback"
            />
          </div>
          <div v-else>
            <XcmBridge
              v-if="token !== null"
              :token="token"
              :class="isHighlightRightUi && 'half-opacity'"
              :set-right-ui="setRightUi"
              :is-highlight-right-ui="isHighlightRightUi"
              :handle-finalized-callback="handleFinalizedCallback"
            />
          </div>
          <Information v-if="rightUi === 'information'" :is-local-transfer="isLocalTransfer" />
          <SelectChain v-if="rightUi === 'select-chain'" v-click-away="cancelHighlight" />
        </div>
      </div>
    </div>
    <ModalSelectChain
      :is-modal-select-chain="isModalSelectChain"
      :handle-modal-select-chain="handleModalSelectChain"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch, watchEffect } from 'vue';
import BackToAsset from 'src/components/assets/transfer/BackToAsset.vue';
import MobileNavigator from 'src/components/assets/transfer/MobileNavigator.vue';
import TransferModeTab from 'src/components/assets/transfer/TransferModeTab.vue';
import Information from 'src/components/assets/transfer/Information.vue';
import LocalTransfer from 'src/components/assets/transfer/LocalTransfer.vue';
import LocalXcmTransfer from 'src/components/assets/transfer/LocalXcmTransfer.vue';
import SelectChain from 'src/components/assets/transfer/SelectChain.vue';
import XcmBridge from 'src/components/assets/transfer/XcmBridge.vue';
import ModalSelectChain from 'src/components/assets/transfer/ModalSelectChain.vue';
import { useAccount, useBalance, useBreakpoints, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { wait } from 'src/hooks/helper/common';
import { useRouter } from 'vue-router';
import { generateNativeAsset } from 'src/modules/xcm/tokens';
import { endpointKey } from 'src/config/chainEndpoints';

type RightUi = 'information' | 'select-chain';

export default defineComponent({
  components: {
    BackToAsset,
    MobileNavigator,
    TransferModeTab,
    Information,
    LocalTransfer,
    XcmBridge,
    SelectChain,
    ModalSelectChain,
    LocalXcmTransfer,
  },
  setup() {
    const isModalSelectChain = ref<boolean>(false);
    const rightUi = ref<RightUi>('information');
    const isLocalTransfer = ref<boolean>(false);
    // Memo: default value is only for displaying placeholder in UI during loading
    const token = ref<Asset>(generateNativeAsset('ASTR'));
    const router = useRouter();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const store = useStore();
    const { screenSize, width } = useBreakpoints();
    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');
    const { nativeTokenSymbol, currentNetworkName, currentNetworkIdx } = useNetworkInfo();

    const isShibuya = computed(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

    const isTransferNativeToken = computed<boolean>(() => {
      const query = router.currentRoute.value.query;
      const symbol = query.token as string;
      return symbol.toLowerCase() === nativeTokenSymbol.value.toLowerCase();
    });

    const setIsLocalTransfer = (result: boolean): void => {
      isLocalTransfer.value = result;
      const query = router.currentRoute.value.query;
      const symbol = query.token as string;
      const network = query.network as string;
      router.replace({
        path: '/assets/transfer',
        query: { token: symbol.toLowerCase(), network, mode: result ? 'local' : 'xcm' },
      });
    };

    const handleModalSelectChain = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectChain.value = isOpen;
    };

    const handleFinalizedCallback = (): void => {
      router.push('/assets');
    };

    const setRightUi = async (ui: RightUi): Promise<void> => {
      if (width.value > screenSize.md) {
        // Memo: tricky way to work with `cancelHighlight` function
        await wait(100);
        rightUi.value = ui;
      } else {
        isModalSelectChain.value = true;
      }
    };

    const redirect = (): void => {
      const token = nativeTokenSymbol.value.toLowerCase();
      const network = currentNetworkName.value.toLowerCase();
      router.push({
        path: '/assets/transfer',
        query: { token, network, mode: 'local' },
      });
    };

    const cancelHighlight = async (e: any): Promise<void> => {
      const openClass = 'container--select-chain';
      if (isHighlightRightUi.value && e.target.className !== openClass) {
        await setRightUi('information');
      }
    };

    const handleUpdateXcmTokenAssets = (): void => {
      if (currentAccount.value) {
        store.dispatch('assets/getAssets', currentAccount.value);
      }
    };

    const handleDefaultConfig = (): void => {
      const currentRouteRef = router.currentRoute.value;
      // Memo: avoid triggering this function whenever users go back to assets page
      if (!currentRouteRef.fullPath.includes('transfer') || !currentNetworkName.value) {
        return;
      }

      const nativeTokenSymbolRef = nativeTokenSymbol.value;
      const query = currentRouteRef.query;
      const s = (query.token as string) || '';
      const symbol = s.toLowerCase();
      const mode = query.mode as string;
      const network = query.network as string;
      isLocalTransfer.value = mode === 'local';

      const isRedirect =
        !symbol || network.toLowerCase() !== currentNetworkName.value.toLowerCase();
      if (isRedirect) return redirect();

      const isFetchedAssets = xcmAssets.value && xcmAssets.value.assets.length !== 0;
      if (isFetchedAssets) {
        try {
          const isNativeToken = symbol === nativeTokenSymbolRef.toLowerCase();
          token.value = isNativeToken
            ? generateNativeAsset(nativeTokenSymbolRef)
            : (xcmAssets.value.assets.find(
                (it) => it.metadata.symbol.toLowerCase() === symbol
              ) as Asset);

          if (!token.value) throw Error('No token is found');
        } catch (error) {
          console.error('error', error);
          redirect();
        }
      }
    };

    watch([currentAccount], handleUpdateXcmTokenAssets, { immediate: true });
    watchEffect(handleDefaultConfig);

    return {
      isLocalTransfer,
      accountData,
      token,
      isHighlightRightUi,
      rightUi,
      isTransferNativeToken,
      isModalSelectChain,
      isShibuya,
      setRightUi,
      handleModalSelectChain,
      cancelHighlight,
      setIsLocalTransfer,
      handleFinalizedCallback,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>

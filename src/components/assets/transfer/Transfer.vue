<template>
  <div>
    <BackToAsset :class="isHighlightRightUi && 'half-opacity'" />
    <MobileNavigator />
    <div class="wrapper--transfer">
      <div class="container--transfer">
        <TransferModeTab
          :is-local-transfer="isLocalTransfer"
          :set-is-local-transfer="handleSetIsLocalTransfer"
          :is-disabled-xcm="isDisabledXcm"
          :class="isHighlightRightUi && 'half-opacity'"
        />
        <div v-if="token" class="wrapper-containers">
          <div v-if="isLocalTransfer">
            <LocalTransfer
              :account-data="accountData"
              :class="isHighlightRightUi && 'half-opacity'"
              :handle-finalized-callback="handleFinalizedCallback"
              :set-right-ui="setRightUi"
              :token="token"
            />
          </div>
          <div v-else>
            <XcmBridge
              v-if="tokens"
              :token="token"
              :class="isHighlightRightUi && 'half-opacity'"
              :set-right-ui="setRightUi"
              :is-highlight-right-ui="isHighlightRightUi"
              :handle-finalized-callback="handleFinalizedCallback"
              :set-is-select-from-chain="setIsSelectFromChain"
              :is-disabled-xcm-button="isDisabledXcm"
            />
          </div>
          <Information v-if="rightUi === 'information'" :is-local-transfer="isLocalTransfer" />
          <SelectChain
            v-if="rightUi === 'select-chain'"
            v-click-away="cancelHighlight"
            :set-chain="handleSetChain"
            :chains="selectableChains"
          />
          <SelectToken
            v-if="rightUi === 'select-token'"
            v-click-away="cancelHighlight"
            :set-token="handleSetToken"
            :tokens="tokens"
          />
        </div>
      </div>
    </div>
    <ModalSelectChain
      v-if="from && to"
      :is-modal-select-chain="isModalSelectChain"
      :handle-modal-select-chain="handleModalSelectChain"
      :set-chain="handleSetChain"
      :chains="selectableChains"
      :selected-chain="isSelectFromChain ? from : to"
    />
    <ModalSelectToken
      v-if="token && tokens"
      :is-modal-select-token="isModalSelectToken"
      :handle-modal-select-token="handleModalSelectToken"
      :set-token="handleSetToken"
      :tokens="tokens"
      :token="token"
    />
  </div>
</template>
<script lang="ts">
import BackToAsset from 'src/components/assets/transfer/BackToAsset.vue';
import Information from 'src/components/assets/transfer/Information.vue';
import LocalTransfer from 'src/components/assets/transfer/LocalTransfer.vue';
import MobileNavigator from 'src/components/assets/transfer/MobileNavigator.vue';
import ModalSelectChain from 'src/components/assets/transfer/ModalSelectChain.vue';
import ModalSelectToken from 'src/components/assets/transfer/ModalSelectToken.vue';
import SelectChain from 'src/components/assets/transfer/SelectChain.vue';
import SelectToken from 'src/components/assets/transfer/SelectToken.vue';
import TransferModeTab from 'src/components/assets/transfer/TransferModeTab.vue';
import XcmBridge from 'src/components/assets/transfer/XcmBridge.vue';
import { endpointKey } from 'src/config/chainEndpoints';
import {
  useAccount,
  useBalance,
  useBreakpoints,
  useNetworkInfo,
  useTransferRouter,
} from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { MOVR } from 'src/modules/token';
import { Chain, XcmChain, xcmToken } from 'src/modules/xcm';
import { ASTR } from 'src/modules/xcm/tokens';
import { useStore } from 'src/store';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
export type RightUi = 'information' | 'select-chain' | 'select-token';

export default defineComponent({
  components: {
    BackToAsset,
    MobileNavigator,
    TransferModeTab,
    Information,
    XcmBridge,
    SelectChain,
    ModalSelectChain,
    LocalTransfer,
    SelectToken,
    ModalSelectToken,
  },
  setup() {
    const isModalSelectChain = ref<boolean>(false);
    const isSelectFromChain = ref<boolean>(false);
    const isModalSelectToken = ref<boolean>(false);
    const rightUi = ref<RightUi>('information');

    const store = useStore();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const { screenSize, width } = useBreakpoints();
    const {
      tokenSymbol,
      router,
      from,
      to,
      token,
      chains,
      tokens,
      isLocalTransfer,
      setIsLocalTransfer,
      setToken,
      setChain,
    } = useTransferRouter();

    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');
    const { nativeTokenSymbol, currentNetworkName, currentNetworkIdx } = useNetworkInfo();
    const isShibuya = computed<boolean>(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

    const isDisabledXcm = computed<boolean>(() => {
      const isEvmNativeToken =
        isH160.value && tokenSymbol.value === nativeTokenSymbol.value.toLowerCase();
      const isH160Movr = isH160.value && token.value?.metadata.symbol === MOVR.symbol;
      const isAstr = token.value?.metadata.symbol === ASTR.symbol;
      const acalaTokens = xcmToken[currentNetworkIdx.value]
        .filter((it) => it.originChain === Chain.ACALA)
        .map((it) => it.symbol.toLowerCase());
      const isAcalaToken = acalaTokens.includes(String(token.value?.metadata.symbol.toLowerCase()));
      return isShibuya.value || isH160Movr || isAcalaToken || isEvmNativeToken || isAstr;
    });

    const isTransferNativeToken = computed<boolean>(() => {
      return tokenSymbol.value === nativeTokenSymbol.value.toLowerCase();
    });

    const setIsSelectFromChain = (result: boolean): void => {
      isSelectFromChain.value = result;
    };

    const handleSetToken = async (t: Asset): Promise<void> => {
      setToken(t);
      await setRightUi('information');
      isModalSelectToken.value && handleModalSelectToken({ isOpen: false });
    };

    const handleSetChain = async (c: string): Promise<void> => {
      const chain = c.toLowerCase();
      const selectedChain = isSelectFromChain.value ? from.value : to.value;
      const isSelectedSameChain = chain === selectedChain;
      if (!isSelectedSameChain) {
        setChain({
          chain,
          isSelectFromChain: isSelectFromChain.value,
        });
      }
      await setRightUi('information');
      isModalSelectChain.value && handleModalSelectChain({ isOpen: false });
    };

    const handleModalSelectChain = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectChain.value = isOpen;
    };
    const handleModalSelectToken = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectToken.value = isOpen;
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
        if (ui === 'select-chain') {
          isModalSelectChain.value = true;
        }
        if (ui === 'select-token') {
          isModalSelectToken.value = true;
        }
      }
    };

    const cancelHighlight = async (e: any): Promise<void> => {
      const openClass = 'container--select-chain';
      if (isHighlightRightUi.value && e.target.className !== openClass) {
        await setRightUi('information');
      }
    };

    const selectableChains = computed<XcmChain[]>(() => {
      const isFromAstar = from.value === currentNetworkName.value.toLowerCase();
      if (isSelectFromChain.value || isFromAstar) {
        return chains.value.filter((it) => !it.name.includes('evm'));
      } else {
        return chains.value;
      }
    });

    const handleSetIsLocalTransfer = (isLocal: boolean): void => {
      setIsLocalTransfer({ isLocal, originChain: token.value!.originChain });
    };

    const handleUpdateXcmTokenAssets = (): void => {
      currentAccount.value && store.dispatch('assets/getAssets', currentAccount.value);
    };

    watch([currentAccount], handleUpdateXcmTokenAssets, { immediate: true });

    return {
      isLocalTransfer,
      accountData,
      token,
      isHighlightRightUi,
      rightUi,
      isTransferNativeToken,
      isModalSelectChain,
      isModalSelectToken,
      isDisabledXcm,
      tokens,
      selectableChains,
      isH160,
      isSelectFromChain,
      from,
      to,
      setRightUi,
      handleModalSelectToken,
      handleModalSelectChain,
      cancelHighlight,
      handleSetIsLocalTransfer,
      handleFinalizedCallback,
      handleSetToken,
      handleSetChain,
      setIsSelectFromChain,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>

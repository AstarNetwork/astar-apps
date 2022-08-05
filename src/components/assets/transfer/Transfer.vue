<template>
  <div>
    <BackToAsset :class="isHighlightRightUi && 'half-opacity'" />
    <MobileNavigator />
    <div class="wrapper--transfer">
      <div class="container--transfer">
        <TransferModeTab
          :is-local-transfer="isLocalTransfer"
          :set-is-local-transfer="setIsLocalTransfer"
          :class="isHighlightRightUi && 'half-opacity'"
        />
        <div class="wrapper-containers">
          <LocalTransfer
            v-if="isLocalTransfer"
            :account-data="accountData"
            :class="isHighlightRightUi && 'half-opacity'"
          />
          <div v-else>
            <XcmBridge
              v-if="token !== null"
              :token="token"
              :class="isHighlightRightUi && 'half-opacity'"
              :set-right-ui="setRightUi"
              :is-highlight-right-ui="isHighlightRightUi"
            />
          </div>
          <Information v-if="rightUi === 'information'" />
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
import SelectChain from 'src/components/assets/transfer/SelectChain.vue';
import XcmBridge from 'src/components/assets/transfer/XcmBridge.vue';
import ModalSelectChain from 'src/components/assets/transfer/ModalSelectChain.vue';
import { useAccount, useBalance, useBreakpoints } from 'src/hooks';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { wait } from 'src/hooks/helper/common';

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
  },
  setup() {
    const isModalSelectChain = ref<boolean>(false);
    const rightUi = ref<RightUi>('information');
    const isLocalTransfer = ref<boolean>(false);
    const setIsLocalTransfer = (result: boolean): void => {
      isLocalTransfer.value = result;
    };
    const token = ref<Asset | null>(null);
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const store = useStore();
    const { screenSize, width } = useBreakpoints();
    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');

    const handleModalSelectChain = ({ isOpen }: { isOpen: boolean }) => {
      isModalSelectChain.value = isOpen;
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

    const cancelHighlight = async (e: any) => {
      const openClass = 'container--select-chain';
      if (isHighlightRightUi.value && e.target.className !== openClass) {
        setRightUi('information');
      }
    };
    const handleUpdateXcmTokenAssets = () => {
      if (currentAccount.value) {
        store.dispatch('assets/getAssets', currentAccount.value);
      }
    };

    watch([currentAccount], handleUpdateXcmTokenAssets, { immediate: true });
    watchEffect(() => {
      console.log('xcmAssets.value', xcmAssets.value);
      if (xcmAssets.value) {
        token.value = xcmAssets.value.assets[0];
      }
    });
    return {
      isLocalTransfer,
      accountData,
      setIsLocalTransfer,
      token,
      isHighlightRightUi,
      rightUi,
      setRightUi,
      cancelHighlight,
      handleModalSelectChain,
      isModalSelectChain,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>

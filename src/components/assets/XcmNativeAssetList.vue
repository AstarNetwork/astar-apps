<template>
  <div>
    <div class="container">
      <div class="row">
        <span class="text--title">{{ $t('assets.xcmAssets') }}</span>
      </div>

      <div v-for="t in xcmAssets" :key="t.id">
        <XcmCurrency
          :token="t"
          :handle-modal-xcm-transfer="handleModalXcmTransfer"
          :handle-modal-xcm-bridge="handleModalXcmBridge"
        />
      </div>
    </div>

    <Teleport to="#app--main">
      <!-- Todo: Add ModalXcmTransfer -->
      <!-- <ModalTransfer
        :is-modal-transfer="isModalTransfer"
        :handle-modal-transfer="handleModalTransfer"
        :symbol="nativeTokenSymbol"
        :account-data="accountData"
      /> -->

      <ModalXcmBridge
        :is-modal-xcm-bridge="isModalXcmBridge"
        :handle-modal-xcm-bridge="handleModalXcmBridge"
        :symbol="nativeTokenSymbol"
        :account-data="accountData"
        :token="token"
      />
    </Teleport>
  </div>
</template>
<script lang="ts">
import { ChainAsset, useXcmAssets } from 'src/hooks';
import { defineComponent, ref } from 'vue';
import ModalXcmBridge from './modals/ModalXcmBridge.vue';
import XcmCurrency from './XcmCurrency.vue';

export default defineComponent({
  components: { XcmCurrency, ModalXcmBridge },
  setup() {
    const isModalXcmTransfer = ref<boolean>(false);
    const isModalXcmBridge = ref<boolean>(false);
    const token = ref<ChainAsset | null>(null);

    const handleModalXcmTransfer = ({ isOpen, currency }: { isOpen: boolean; currency: any }) => {
      isModalXcmTransfer.value = isOpen;
      token.value = currency;
    };

    const handleModalXcmBridge = ({ isOpen, currency }: { isOpen: boolean; currency: any }) => {
      isModalXcmBridge.value = isOpen;
      token.value = currency;
    };

    const { xcmAssets, handleUpdateTokenBalances } = useXcmAssets();

    return {
      handleModalXcmTransfer,
      handleModalXcmBridge,
      xcmAssets,
      isModalXcmBridge,
      token,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>

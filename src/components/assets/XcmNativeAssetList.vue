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
        <!-- {{ t.id }} -->
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

      <!-- <ModalXcmBridge
        :is-modal-transfer="isModalTransfer"
        :handle-modal-transfer="handleModalTransfer"
        :symbol="nativeTokenSymbol"
        :account-data="accountData"
      /> -->
    </Teleport>
  </div>
</template>
<script lang="ts">
import { useXcmAssets } from 'src/hooks';
import { useStore } from 'src/store';
import { defineComponent, ref, watchEffect } from 'vue';
import XcmCurrency from './XcmCurrency.vue';

export default defineComponent({
  components: { XcmCurrency },
  setup() {
    const isModalXcmTransfer = ref<boolean>(false);
    const isModalXcmBridge = ref<boolean>(false);
    const token = ref();

    const store = useStore();

    const handleModalXcmTransfer = ({ isOpen, currency }: { isOpen: boolean; currency: any }) => {
      isModalXcmTransfer.value = isOpen;
      token.value = currency;
    };

    const handleModalXcmBridge = ({ isOpen, currency }: { isOpen: boolean; currency: any }) => {
      isModalXcmBridge.value = isOpen;
      token.value = currency;
    };

    const { xcmAssets, handleUpdateTokenBalances } = useXcmAssets();

    watchEffect(() => {
      console.log('xcmAssets', xcmAssets.value);
    });

    return {
      handleModalXcmTransfer,
      handleModalXcmBridge,
      xcmAssets,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>

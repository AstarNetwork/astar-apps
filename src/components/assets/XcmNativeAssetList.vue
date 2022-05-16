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
      <ModalXcmTransfer
        :is-modal-xcm-transfer="isModalXcmTransfer"
        :handle-modal-xcm-transfer="handleModalXcmTransfer"
        :account-data="accountData"
        :token="token"
      />

      <ModalXcmBridge
        :is-modal-xcm-bridge="isModalXcmBridge"
        :handle-modal-xcm-bridge="handleModalXcmBridge"
        :account-data="accountData"
        :token="token"
      />
    </Teleport>
  </div>
</template>
<script lang="ts">
import { ChainAsset, useBalance, useXcmAssets } from 'src/hooks';
import { computed, defineComponent, ref } from 'vue';
import ModalXcmTransfer from './modals/ModalXcmTransfer.vue';
import ModalXcmBridge from './modals/ModalXcmBridge.vue';
import XcmCurrency from './XcmCurrency.vue';
import { useStore } from 'src/store';

export default defineComponent({
  components: { XcmCurrency, ModalXcmBridge, ModalXcmTransfer },
  setup() {
    const isModalXcmTransfer = ref<boolean>(false);
    const isModalXcmBridge = ref<boolean>(false);
    const token = ref<ChainAsset | null>(null);

    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { accountData } = useBalance(selectedAddress);
    const { xcmAssets } = useXcmAssets();

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

    return {
      xcmAssets,
      isModalXcmBridge,
      isModalXcmTransfer,
      token,
      accountData,
      handleModalXcmTransfer,
      handleModalXcmBridge,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>

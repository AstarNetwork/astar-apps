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
          :handle-modal-xcm-bridge="handleModalBridge"
        />
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
        :handle-modal-xcm-bridge="handleModalBridge"
        :account-data="accountData"
        :token="token"
        :handle-update-xcm-token-balances="handleUpdateXcmTokenBalances"
      />

      <ModalHrmpBridge
        :is-modal-hrmp-bridge="isModalHrmpBridge"
        :handle-modal-hrmp-bridge="handleModalBridge"
        :account-data="accountData"
        :token="token"
        :handle-update-xcm-token-balances="handleUpdateXcmTokenBalances"
      />
    </Teleport>
  </div>
</template>
<script lang="ts">
import { ChainAsset, useBalance } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref } from 'vue';
import ModalXcmBridge from './modals/ModalXcmBridge.vue';
import ModalHrmpBridge from './modals/ModalHrmpBride.vue';
import ModalXcmTransfer from './modals/ModalXcmTransfer.vue';
import XcmCurrency from './XcmCurrency.vue';
import { parachains } from 'src/modules/xcm';

export default defineComponent({
  components: { XcmCurrency, ModalXcmBridge, ModalHrmpBridge, ModalXcmTransfer },
  props: {
    xcmAssets: {
      type: Array as PropType<ChainAsset[]>,
      required: true,
    },
    handleUpdateXcmTokenBalances: {
      type: Function,
      required: true,
    },
  },
  setup() {
    const isModalXcmTransfer = ref<boolean>(false);
    const isModalXcmBridge = ref<boolean>(false);
    const isModalHrmpBridge = ref<boolean>(false);
    const token = ref<ChainAsset | null>(null);

    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { accountData } = useBalance(selectedAddress);

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

    const handleModalBridge = ({ isOpen, currency }: { isOpen: boolean; currency: ChainAsset }) => {
      if (!currency) {
        isModalHrmpBridge.value = false;
        isModalXcmBridge.value = false;
        token.value = null;
        return;
      }
      const isParachain = parachains.find(
        (it) => it.toLowerCase() === currency.originChain.toLowerCase()
      );
      if (isParachain) {
        isModalHrmpBridge.value = isOpen;
      } else {
        isModalXcmBridge.value = isOpen;
      }
      token.value = currency;
      console.log('isModalHrmpBridge', isModalHrmpBridge.value);
    };

    return {
      isModalXcmBridge,
      isModalHrmpBridge,
      isModalXcmTransfer,
      token,
      accountData,
      handleModalXcmTransfer,
      handleModalBridge,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>

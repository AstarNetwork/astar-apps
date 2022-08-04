<template>
  <AstarModal
    :is-modal-open="isModalEvmWithdraw"
    :title="$t('assets.modals.titleWithdraw', { token: nativeTokenSymbol })"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="wrapper--modal wrapper--withdraw">
      <div class="box--withdraw-amount">
        <div class="box__column-amount">
          <span class="text--accent">{{ $t('assets.modals.availableToWithdraw') }}</span>
          <span class="text--xl">{{ $n(truncate(numEvmDeposit)) }} {{ nativeTokenSymbol }}</span>
        </div>
      </div>
      <SpeedConfiguration
        :gas-cost="nativeTipPrice"
        :selected-gas="selectedTip"
        :set-selected-gas="setSelectedTip"
      />
      <div class="wrapper__row--button">
        <button :disabled="0 >= numEvmDeposit" class="btn btn--confirm" @click="sendTransaction">
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </AstarModal>
</template>
<script lang="ts">
import { useEvmDeposit } from 'src/hooks';
import { defineComponent, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from 'src/hooks/helper/common';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import { truncate } from 'src/hooks/helper/common';
import AstarModal from 'src/components/common/AstarModal.vue';

export default defineComponent({
  components: { SpeedConfiguration, AstarModal },
  props: {
    nativeTokenSymbol: {
      type: String,
      required: true,
    },
    isModalEvmWithdraw: {
      type: Boolean,
      required: true,
    },
    handleModalEvmWithdraw: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalEvmWithdraw({ isOpen: false });
      isClosingModal.value = false;
    };
    const { numEvmDeposit, sendTransaction, selectedTip, nativeTipPrice, setSelectedTip } =
      useEvmDeposit(closeModal);
    return {
      closeModal,
      numEvmDeposit,
      sendTransaction,
      isClosingModal,
      selectedTip,
      nativeTipPrice,
      setSelectedTip,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-evm-withdraw.scss';
</style>

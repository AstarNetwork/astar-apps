<template>
  <modal-wrapper
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
      <speed-configuration
        :gas-cost="nativeTipPrice"
        :selected-gas="selectedTip"
        :set-selected-gas="setSelectedTip"
      />
      <div class="wrapper__row--button">
        <astar-button
          :disabled="0 >= numEvmDeposit"
          class="button--confirm"
          @click="handleWithdraw"
        >
          {{ $t('confirm') }}
        </astar-button>
      </div>
    </div>
  </modal-wrapper>
</template>
<script lang="ts">
import { useEvmDeposit } from 'src/hooks';
import { defineComponent, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from '@astar-network/astar-sdk-core';
import { truncate } from '@astar-network/astar-sdk-core';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';

export default defineComponent({
  components: { SpeedConfiguration, ModalWrapper },
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
      useEvmDeposit();

    const handleWithdraw = async (): Promise<void> => {
      await closeModal();
      await sendTransaction();
    };

    return {
      closeModal,
      numEvmDeposit,
      handleWithdraw,
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

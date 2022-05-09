<template>
  <astar-simple-modal
    :show="isModalEvmWithdraw"
    :title="`Withdraw ${nativeTokenSymbol}`"
    :is-closing="isClosingModal"
    @close="closeModal"
  >
    <div class="wrapper--modal wrapper--withdraw">
      <div class="box--withdraw-amount">
        <div class="box__column-amount">
          <span class="text--accent">{{ $t('assets.modals.availableToWithdraw') }}</span>
          <span class="text--xl">{{ $n(numEvmDeposit) }} {{ nativeTokenSymbol }}</span>
        </div>
      </div>
      <div class="wrapper__row--button">
        <button :disabled="0 >= numEvmDeposit" class="btn btn--confirm" @click="sendTransaction">
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { useEvmDeposit } from 'src/hooks';
import { defineComponent, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from 'src/hooks/helper/common';

export default defineComponent({
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
    const { numEvmDeposit, sendTransaction } = useEvmDeposit(closeModal);
    return {
      closeModal,
      numEvmDeposit,
      sendTransaction,
      isClosingModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-evm-withdraw.scss';
</style>

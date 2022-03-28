<template>
  <astar-simple-modal
    :show="isModalEvmWithdraw"
    :title="`Withdraw ${nativeTokenSymbol}`"
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
        <button class="btn btn--confirm">
          {{ $t('connect') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
 <script lang="ts">
import { defineComponent } from 'vue';

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
    const closeModal = (): void => {
      props.handleModalEvmWithdraw({ isOpen: false });
    };
    return {
      closeModal,
    };
  },
});
</script>

 <style lang="scss" scoped>
@use 'src/components/assets/styles/modal-evm-withdraw.scss';
</style>
<template>
  <astar-simple-modal :show="isModalVesting" title="Vesting info" @close="closeModal">
    <div class="wrapper--modal wrapper--vesting">
      <div class="box--vesting-info">
        <div class="box__row">
          <span>{{ $t('assets.modals.totalDistribution') }}</span>
          <span>{{ $n(totalDistribution) }}</span>
        </div>
        <div class="box__row">
          <span>{{ $t('assets.modals.alreadyVested') }}</span>
          <span>{{ $n(vestedAmount) }}</span>
        </div>
        <div class="box__row">
          <span>{{ $t('assets.modals.remainingVests') }}</span>
          <span>{{ $n(totalDistribution - vestedAmount) }}</span>
        </div>
        <div class="box__row--per-block">
          <span>{{
            $t('assets.modals.unlockPerBlock', {
              perToken: $n(unlockPerBlock),
              symbol: nativeTokenSymbol,
              untilBlock: $n(untilBlock),
            })
          }}</span>
        </div>
      </div>
      <div class="box--unlock-amount">
        <div class="box__column-amount">
          <span class="text--accent">{{ $t('assets.modals.availableToUnlocked') }}</span>
          <span class="text--xl">{{ $n(claimableAmount) }} {{ nativeTokenSymbol }}</span>
        </div>
      </div>
      <div class="wrapper__row--button">
        <button class="btn btn--confirm" :disabled="0 >= claimableAmount" @click="sendTransaction">
          {{ $t('assets.modals.unlock') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { AccountData, useVesting } from 'src/hooks';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    nativeTokenSymbol: {
      type: String,
      required: true,
    },
    isModalVesting: {
      type: Boolean,
      required: true,
    },
    handleModalVesting: {
      type: Function,
      required: true,
    },
    accountData: {
      type: Object as PropType<AccountData>,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const closeModal = (): void => {
      props.handleModalVesting({ isOpen: false });
    };
    const {
      claimableAmount,
      vestedAmount,
      totalDistribution,
      unlockPerBlock,
      untilBlock,
      sendTransaction,
    } = useVesting(closeModal);

    return {
      closeModal,
      claimableAmount,
      vestedAmount,
      totalDistribution,
      unlockPerBlock,
      untilBlock,
      sendTransaction,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-vesting.scss';
</style>

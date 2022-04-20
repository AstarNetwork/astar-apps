<template>
  <astar-simple-modal
    :is-closing="isClosingModal"
    :show="isModalVesting"
    title="Vesting info"
    @close="closeModal"
  >
    <div class="wrapper--modal wrapper--vesting">
      <div class="container--vestings">
        <div v-for="(vesting, index) in info.vestings" :key="index">
          <div class="box--vesting-info">
            <div class="box__row">
              <span>{{ $t('assets.modals.totalDistribution') }}</span>
              <span>{{ $n(vesting.totalDistribution) }}</span>
            </div>
            <div class="box__row">
              <span>{{ $t('assets.modals.alreadyVested') }}</span>
              <span>{{ $n(vesting.vestedAmount) }}</span>
            </div>
            <div class="box__row">
              <span>{{ $t('assets.modals.remainingVests') }}</span>
              <span>{{ $n(vesting.totalDistribution - vesting.vestedAmount) }}</span>
            </div>
            <div class="box__row--per-block">
              <span>{{
                $t('assets.modals.unlockPerBlock', {
                  perToken: $n(vesting.unlockPerBlock),
                  symbol: nativeTokenSymbol,
                  untilBlock: $n(vesting.untilBlock),
                })
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="box--unlock-amount">
        <div class="box__column-amount">
          <span class="text--accent">{{ $t('assets.modals.availableToUnlocked') }}</span>
          <span class="text--xl">{{ $n(info.claimableAmount) }} {{ nativeTokenSymbol }}</span>
        </div>
      </div>
      <div class="wrapper__row--button">
        <button
          class="btn btn--confirm"
          :disabled="0 >= info.claimableAmount"
          @click="sendTransaction"
        >
          {{ $t('assets.modals.unlock') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { AccountData, useVesting } from 'src/hooks';
import { defineComponent, PropType, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';

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
    const isClosingModal = ref<boolean>(false);
    const closeModal = (): void => {
      isClosingModal.value = true;
      setTimeout(() => {
        props.handleModalVesting({ isOpen: false });
        isClosingModal.value = false;
      }, fadeDuration);
    };
    const { info, sendTransaction } = useVesting(closeModal);

    return {
      info,
      isClosingModal,
      closeModal,
      sendTransaction,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-vesting.scss';
</style>

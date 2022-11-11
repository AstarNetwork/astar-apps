<template>
  <modal-wrapper
    :is-modal-open="isModalVesting"
    :title="$t('assets.modals.titleVesting')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="wrapper--modal wrapper--vesting">
      <div class="container--vestings">
        <div v-for="(vesting, index) in info.vestings" :key="index">
          <div class="box--vesting-info">
            <div class="box__row">
              <span>{{ $t('assets.modals.totalDistribution') }}</span>
              <span>{{ $n(truncate(vesting.totalDistribution)) }}</span>
            </div>
            <div class="box__row">
              <span>{{ $t('assets.modals.alreadyVested') }}</span>
              <span>{{ $n(truncate(vesting.vestedAmount)) }}</span>
            </div>
            <div class="box__row">
              <span>{{ $t('assets.modals.remainingVests') }}</span>
              <span>{{ $n(truncate(vesting.totalDistribution - vesting.vestedAmount)) }}</span>
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
          <span class="text--accent">{{ $t('assets.modals.availableToUnlock') }}</span>
          <span class="text--xl"
            >{{ $n(truncate(info.claimableAmount)) }} {{ nativeTokenSymbol }}
          </span>
        </div>
      </div>
      <speed-configuration
        :gas-cost="nativeTipPrice"
        :selected-gas="selectedTip"
        :set-selected-gas="setSelectedTip"
      />
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
  </modal-wrapper>
</template>
<script lang="ts">
import { AccountData, useVesting } from 'src/hooks';
import { defineComponent, PropType, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from 'src/hooks/helper/common';
import SpeedConfiguration from 'src/components/common/SpeedConfiguration.vue';
import { truncate } from 'src/hooks/helper/common';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';

export default defineComponent({
  components: { SpeedConfiguration, ModalWrapper },
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
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalVesting({ isOpen: false });
      isClosingModal.value = false;
    };
    const { info, sendTransaction, selectedTip, nativeTipPrice, setSelectedTip } =
      useVesting(closeModal);

    return {
      info,
      isClosingModal,
      closeModal,
      sendTransaction,
      selectedTip,
      nativeTipPrice,
      setSelectedTip,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-vesting.scss';
</style>

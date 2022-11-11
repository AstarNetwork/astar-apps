<template>
  <modal-wrapper
    :is-modal-open="show"
    :title="$t('dappStaking.withdraw')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="wrapper">
      <div class="row--guide">
        <span class="text--guide">
          {{ $t('myDapps.withdrawGuide') }}
        </span>
      </div>
      <div class="box--container">
        <div>
          <span class="text--title">{{ $t('myDapps.withdrawTitle') }}</span>
        </div>
        <div class="text--amount">
          <format-balance :balance="withdrawAmount" />
        </div>
      </div>
      <astar-button class="confirm-button" @click="confirm">{{ $t('confirm') }}</astar-button>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FormatBalance from 'components/common/FormatBalance.vue';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from 'src/hooks/helper/common';

export default defineComponent({
  components: { FormatBalance, ModalWrapper },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    withdrawAmount: {
      type: String,
      default: null,
    },
  },
  emits: ['update:is-open', 'confirm'],
  setup(props, { emit }) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      emit('update:is-open', false);
      isClosingModal.value = false;
    };

    const confirm = () => {
      closeModal();
      emit('confirm');
    };

    return {
      confirm,
      isClosingModal,
      closeModal,
    };
  },
});
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 36px;
  @media (min-width: $md) {
    padding-bottom: 0px;
  }
}

.text--guide {
  font-weight: 500;
  font-size: 14px;
}

.row--guide {
  @media (min-width: $md) {
    align-self: flex-start;
  }
}

.box--container {
  font-family: 'Inter';
  margin-top: 32px;
  margin-bottom: 32px;
  color: $gray-1;
  text-align: center;
  padding: 16px;
  background: $gray-1;
  border-radius: 6px;
  width: 340px;
  @media (min-width: $md) {
    width: 400px;
  }

  .text--title {
    font-weight: 600;
    font-size: 14px;
  }
  .text--amount {
    font-weight: 600;
    font-size: 22px;
    margin-top: 16px;
    color: $gray-5-selected;
  }
}

.confirm-button {
  width: 340px;
  font-size: 22px;
  font-weight: 600;
  height: 44px;
  @media (min-width: $md) {
    width: 400px;
  }
}

.body--dark {
  .box--container {
    background: $gray-7;
    .text--amount {
      color: $gray-1;
    }
  }
}
</style>

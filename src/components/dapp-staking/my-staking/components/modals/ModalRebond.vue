<template>
  <modal-wrapper
    :is-modal-open="show"
    :title="$t('dappStaking.myDapps.rebond')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="text--guide">
      {{ $t('myDapps.rebondGuide') }}
    </div>
    <div class="box--container">
      <div>
        <span class="text--title">{{ $t('myDapps.rebondTitle') }}</span>
      </div>
      <div class="text--amount"><format-balance :balance="rebondAmount" /></div>
    </div>
    <astar-button class="button--confirm" @click="confirm">{{ $t('confirm') }}</astar-button>
  </modal-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FormatBalance from 'components/common/FormatBalance.vue';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from '@astar-network/astar-sdk-core';

export default defineComponent({
  components: { FormatBalance, ModalWrapper },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    rebondAmount: {
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
.text--guide {
  font-weight: 500;
  font-size: 14px;
}

.box--container {
  font-family: 'Inter';
  margin-top: 20px;
  margin-bottom: 16px;
  color: $gray-1;
  text-align: center;
  padding: 16px;
  background: $gray-1;
  border-radius: 6px;

  .text--title {
    font-weight: 600;
    font-size: 14px;
  }

  .text--amount {
    font-weight: 600;
    font-size: 22px;
    margin-top: 16px;
    color: $navy-1;
  }
}

.button--confirm {
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

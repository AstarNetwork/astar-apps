<template>
  <modal-wrapper
    :is-modal-open="isModal"
    title=""
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="wrapper--modal">
      <div class="row--title">
        <div class="icon--warning">
          <astar-icon-warning size="40" />
        </div>
        <span>{{ $t('warning.warning') }}</span>
      </div>
      <div class="row--warning-box">
        <span>{{ $t('assets.modals.lockdropWarning.warning') }} </span>
      </div>
      <div class="row--message">
        <span class="text--message">
          {{ $t('assets.modals.lockdropWarning.note') }}
        </span>
      </div>
      <div class="box--list">
        <li>
          <span>
            {{ $t('assets.modals.lockdropWarning.list1') }}
          </span>
        </li>
        <li>
          <span>
            {{ $t('assets.modals.lockdropWarning.list2') }}
          </span>
        </li>
        <li>
          <span>
            {{ $t('assets.modals.lockdropWarning.list3') }}
          </span>
        </li>
        <li>
          <span>
            {{ $t('assets.modals.lockdropWarning.list4') }}
          </span>
        </li>
      </div>

      <div class="wrapper__row--button">
        <astar-button class="button--confirm" @click="closeModal">
          {{ $t('assets.modals.lockdropWarning.moveFundsNow') }}
        </astar-button>
      </div>
    </div>
  </modal-wrapper>
</template>
<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: { ModalWrapper },
  props: {
    isModal: {
      type: Boolean,
      required: true,
    },
    handleModal: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModal({ isOpen: false });
      isClosingModal.value = false;
    };

    return {
      closeModal,
      isClosingModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-lockdrop-warning.scss';
</style>

<template>
  <modal-wrapper
    :is-modal-open="show"
    title=""
    :is-closing="isClosingModal"
    :close-modal="closeModal"
    class-name="highest-z-index"
  >
    <div class="wrapper--modal-bridge-high-traffic">
      <div class="row--description">
        <span class="text--md">
          {{ $t('bridge.modals.highTraffic.text1') }}
        </span>
        <span class="text--md">
          {{ $t('bridge.modals.highTraffic.text2') }}
        </span>
      </div>
      <div class="bottoms--modal-bridge-high-traffic">
        <button @click="closeModal">{{ $t('bridge.modals.highTraffic.understood') }}</button>
      </div>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { truncate, wait } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { useBreakpoints } from 'src/hooks';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: { ModalWrapper },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    setIsOpen: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.setIsOpen(false);
      isClosingModal.value = false;
    };

    const { width, screenSize } = useBreakpoints();

    return {
      width,
      screenSize,
      close,
      truncate,
      closeModal,
      isClosingModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/modal-bridge-high-traffic.scss';
</style>

<template>
  <astar-modal-drawer
    :show="isOpen && !isSelected"
    :title="$t('wallet.accountUnification')"
    :is-closing="isClosing"
    :is-back="true"
    :handle-back="backModal"
    @close="closeModal"
  >
    <div class="wrapper--modal-account">
      <div class="wrapper__row--button">
        <astar-button class="btn--connect"> Create a new Unified Account </astar-button>
      </div>
    </div>
    <div class="wrapper--modal-account">
      <div class="wrapper__row--button">
        <astar-button class="btn--connect"> {{ $t('connect') }} </astar-button>
      </div>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { useBreakpoints } from 'src/hooks';
import { defineComponent, onUnmounted, ref } from 'vue';

export default defineComponent({
  components: {},
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    openSelectModal: {
      type: Function,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const isSelected = ref<boolean>(false);
    const isClosing = ref<boolean>(false);

    const closeModal = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
      emit('update:is-open', false);
    };

    const backModal = async (): Promise<void> => {
      await closeModal();
      props.openSelectModal();
    };

    const { width, screenSize } = useBreakpoints();

    const windowHeight = ref<number>(window.innerHeight);
    const onHeightChange = (): void => {
      const adjustment = width.value > screenSize.sm ? 520 : 390;
      windowHeight.value = window.innerHeight - adjustment;
    };

    window.addEventListener('resize', onHeightChange);
    onHeightChange();

    onUnmounted(() => {
      window.removeEventListener('resize', onHeightChange);
    });

    return {
      windowHeight,
      isSelected,
      isClosing,
      closeModal,
      backModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account.scss';
</style>

<template>
  <astar-default-modal
    v-if="show"
    :show="show"
    :is-closing="isClosingModal"
    :width="590"
    :class="'highest-z-index wrapper--modal-onboarding'"
    @close="decline()"
  >
    <div class="">test test</div>
    <div class="bg--modal-onboarding">
      <img :src="require('/src/staking-v3/assets/leaderboard_bg.webp')" alt="" />
    </div>
  </astar-default-modal>
</template>

<script lang="ts">
import { truncate, wait } from '@astar-network/astar-sdk-core';
import { fadeDuration } from '@astar-network/astar-ui';
import { defineComponent, ref } from 'vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export default defineComponent({
  components: {},
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

    if (localStorage.getItem(LOCAL_STORAGE.CONFIRM_COOKIE_POLICY)) {
      closeModal();
    }

    const accept = (): void => {
      localStorage.setItem(LOCAL_STORAGE.CONFIRM_COOKIE_POLICY, 'true');
      closeModal();
    };

    const decline = (): void => {
      window.open('https://astar.network/', '_self');
    };

    return {
      close,
      truncate,
      closeModal,
      isClosingModal,
      accept,
      decline,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/modal-onboarding.scss';
</style>

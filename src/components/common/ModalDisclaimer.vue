<template>
  <astar-default-modal
    v-if="show"
    :show="show"
    :title="$t('disclaimer.disclaimer')"
    :is-closing="isClosingModal"
    :width="650"
    :class="'highest-z-index'"
    @close="decline()"
  >
    <div class="wrapper--modal-disclaimer">
      <div class="row--description">
        <div class="text--md">
          {{ $t('disclaimer.introduce1') }}
          <a class="link--underline" href="https://astar.network/term-of-use" target="_blank">{{
            $t('disclaimer.terms')
          }}</a>
          {{ $t('and') }}
          <a class="link--underline" href="https://astar.network/privacy-policy" target="_blank">{{
            $t('disclaimer.privacy')
          }}</a>
          {{ $t('disclaimer.introduce2') }}
        </div>
        <div class="text--title">{{ $t('disclaimer.terms') }}</div>
        <div class="text--lg">{{ $t('disclaimer.chapter1') }}</div>
        <div class="text--md">
          {{ $t('disclaimer.para1') }}
        </div>
        <div class="text--lg">{{ $t('disclaimer.chapter2') }}</div>
        <div class="text--md">
          {{ $t('disclaimer.para1') }}
        </div>
        <div class="text--lg">{{ $t('disclaimer.chapter3') }}</div>
        <div class="text--md">
          {{ $t('disclaimer.para2') }}
        </div>
        <div class="text--md">
          {{ $t('disclaimer.closeWord') }}
        </div>
      </div>

      <div class="container--buttons">
        <div class="row--button">
          <astar-button class="btn--action" @click="accept()">
            <span class="text--button">{{ $t('disclaimer.agree') }}</span>
          </astar-button>
        </div>
        <div class="row--button">
          <astar-button class="btn--action btn--decline" @click="decline()">{{
            $t('disclaimer.decline')
          }}</astar-button>
        </div>
      </div>
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
@use 'src/components/common/styles/modal-disclaimer.scss';
</style>

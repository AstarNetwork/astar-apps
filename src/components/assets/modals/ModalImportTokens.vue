<template>
  <astar-simple-modal
    v-if="!isLoading"
    :show="isModalImportTokens"
    :title="$t('assets.importTokens')"
    :is-closing="isClosingModal"
    @close="closeModal"
  >
    <div class="wrapper--modal wrapper--import-tokens">
      <div class="wrapper__row--information">
        <span class="text--md">
          {{ $t('assets.modals.riskOfImportTokens') }}
        </span>
      </div>

      <div class="box--import-tokens box--hover--active">
        <div class="box__title">
          <span class="text--md">
            {{ $t('assets.modals.tokenContractAddress') }}
          </span>
        </div>
        <div>
          <input v-model="search" type="text" placeholder="Input Address" class="input--search" />
        </div>
      </div>

      <div class="box--import-tokens">
        <div class="box__title">
          <span class="text--md">{{ $t('ticker') }}</span>
        </div>
        <div>
          <span class="text--title">{{ tokenTicker }}</span>
        </div>
      </div>

      <div class="wrapper__row--button">
        <button class="btn btn--confirm" :disabled="false" @click="handleRequest">
          {{ $t('confirm') }}
        </button>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from 'src/hooks/helper/common';

export default defineComponent({
  props: {
    isModalImportTokens: {
      type: Boolean,
      required: true,
    },
    handleModalImportTokens: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const tokenTicker = ref<string>('');
    const search = ref<string>('');

    const resetStates = (): void => {
      tokenTicker.value = '';
      search.value = '';
    };

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalImportTokens({ isOpen: false });
      resetStates();
      isClosingModal.value = false;
    };

    const handleRequest = async (): Promise<void> => {
      try {
        // todo
        console.log('handleRequest');
      } catch (error) {
        console.error(error);
      } finally {
        closeModal();
      }
    };

    return {
      search,
      tokenTicker,
      isClosingModal,
      closeModal,
      handleRequest,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-import-token.scss';
</style>

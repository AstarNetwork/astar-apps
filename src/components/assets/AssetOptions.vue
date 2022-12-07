<template>
  <div v-click-away="closeOption" class="wrapper--asset-options">
    <div class="icon-vert" @click="isOptionsOpen = true">
      <astar-icon-vert />
    </div>
    <div v-if="isOptionsOpen" class="box--options">
      <button v-if="isImportModal" class="row--option" @click="handleImportTokens">
        <div>
          <span class="icon--plus"> + </span>
        </div>
        <span class="text--option">{{ $t('assets.importTokens') }}</span>
      </button>
      <button class="row--option" @click="handleHideSmallBalances">
        <template v-if="isHideSmallBalances">
          <div class="icon-hide">
            <astar-icon-unhide />
          </div>
          <span class="text--option">{{ $t('assets.unhideSmallBalances') }}</span>
        </template>
        <template v-else>
          <div class="icon-hide">
            <astar-icon-hide />
          </div>
          <span class="text--option">{{ $t('assets.hideSmallBalances') }}</span>
        </template>
      </button>
    </div>

    <ModalImportTokens
      v-if="isImportModal"
      :is-modal-import-tokens="isModalImportTokens"
      :handle-modal-import-tokens="handleModalImportTokens"
      :tokens="tokens"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue';
import ModalImportTokens from 'src/components/assets/modals/ModalImportTokens.vue';
import { SelectedToken } from 'src/c-bridge';
import { useStore } from 'src/store';
import { Asset } from 'src/v2/models';

export default defineComponent({
  components: {
    ModalImportTokens,
  },
  props: {
    isImportModal: {
      type: Boolean,
      required: true,
    },
    isHideSmallBalances: {
      type: Boolean,
      required: true,
    },
    toggleIsHideSmallBalances: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Object as PropType<SelectedToken[] | Asset[]>,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const isOptionsOpen = ref<boolean>(false);
    const isModalImportTokens = ref<boolean>(false);

    const closeOption = (): void => {
      isOptionsOpen.value = false;
    };

    const handleModalImportTokens = ({ isOpen }: { isOpen: boolean }) => {
      isModalImportTokens.value = isOpen;
    };

    const handleImportTokens = (): void => {
      isModalImportTokens.value = true;
      closeOption();
    };

    const handleHideSmallBalances = (): void => {
      props.toggleIsHideSmallBalances();
      closeOption();
    };
    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

    return {
      isModalImportTokens,
      isOptionsOpen,
      isLoading,
      closeOption,
      handleHideSmallBalances,
      handleImportTokens,
      handleModalImportTokens,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-options.scss';
</style>

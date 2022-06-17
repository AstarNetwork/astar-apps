<template>
  <div v-click-away="closeOption" class="wrapper--asset-options">
    <div @click="isOptionsOpen = true">
      <!-- Todo: load from astar-ui -->
      <IconVert class="icon-vert" />
    </div>
    <div v-if="isOptionsOpen" class="box--options">
      <button class="row--option" @click="handleImportTokens">
        <div>
          <span class="icon--plus"> + </span>
        </div>
        <span class="text--option">{{ $t('assets.importTokens') }}</span>
      </button>
      <button class="row--option" @click="handleHideSmallBalances">
        <!-- Todo: load from astar-ui -->
        <template v-if="isHideSmallBalances">
          <IconUnhide class="icon-hide" />
          <span class="text--option">{{ $t('assets.unhideSmallBalances') }}</span>
        </template>
        <template v-else>
          <IconHide class="icon-hide" />
          <span class="text--option">{{ $t('assets.hideSmallBalances') }}</span>
        </template>
      </button>
    </div>

    <Teleport to="#app--main">
      <ModalImportTokens
        :is-modal-import-tokens="isModalImportTokens"
        :handle-modal-import-tokens="handleModalImportTokens"
      />
    </Teleport>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import IconVert from '/src/components/common/IconVert.vue';
import IconHide from '/src/components/common/IconHide.vue';
import IconUnhide from '/src/components/common/IconUnhide.vue';
import ModalImportTokens from 'src/components/assets/modals/ModalImportTokens.vue';

export default defineComponent({
  components: {
    IconVert,
    IconHide,
    IconUnhide,
    ModalImportTokens,
  },
  props: {
    isHideSmallBalances: {
      type: Boolean,
      required: true,
    },
    toggleIsHideSmallBalances: {
      type: Function,
      required: true,
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

    return {
      isModalImportTokens,
      isOptionsOpen,
      closeOption,
      handleHideSmallBalances,
      handleImportTokens,
      handleModalImportTokens,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/evm-asset-options.scss';
</style>

<template>
  <Teleport to="#app--main">
    <div :class="[!isLoading && 'highest-z-index', className]">
      <astar-default-modal
        v-if="isModalOpen"
        :show="isModalOpen"
        :title="title"
        :is-closing="isClosing"
        :width="width"
        @close="closeModal()"
      >
        <slot />
      </astar-default-modal>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { useStore } from 'src/store';
import { defineComponent, computed } from 'vue';

// Memo: wrapper for astar-default-modal
export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: false,
      default: '',
    },
    isModalOpen: {
      type: Boolean,
      required: true,
    },
    isClosing: {
      type: Boolean,
      required: true,
    },
    closeModal: {
      type: Function,
      required: true,
    },
    width: {
      type: Number,
      required: false,
      default: 500,
    },
  },
  setup() {
    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    return {
      isLoading,
    };
  },
});
</script>

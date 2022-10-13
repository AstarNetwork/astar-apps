<template>
  <Teleport to="#app--main">
    <div :class="[!isLoading && 'highest-z-index', className]">
      <astar-simple-modal
        v-if="isModalOpen"
        :show="isModalOpen"
        :title="title"
        :is-closing="isClosing"
        @close="closeModal"
      >
        <slot />
      </astar-simple-modal>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { useStore } from 'src/store';
import { defineComponent, computed } from 'vue';

// Memo: wrapper for astar-simple-ui
// Ref: https://github.com/AstarNetwork/astar-apps/pull/477#discussion_r933781042

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

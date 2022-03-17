<template>
  <div>
    <Button>Test</Button>
    <my-button>Test2</my-button>
    <div v-for="(n, i) in 7" :key="i">
      <astar-text :type="`H${i + 1}`">H {{ i + 1 }}</astar-text>
    </div>
    <Foo />
  </div>
</template>

<script lang="ts">
import { useSidebar } from 'src/hooks';
import { defineComponent } from 'vue';
import { useStore } from 'src/store';
import { Button, Foo } from 'astar-ui';

export default defineComponent({
  components: { Button, Foo },
  setup() {
    const { isOpen } = useSidebar();
    const store = useStore();

    return {
      isOpen,
    };
  },
});
</script>

<style scoped>
.open-sidebar {
  @apply tw--ml-3 tw-p-2 tw-rounded-full tw-group;
}
.open-sidebar:hover {
  @apply tw-bg-blue-100 dark:tw-bg-darkGray-600 tw-text-gray-900;
}
.open-sidebar:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 tw-bg-blue-50;
}
</style>

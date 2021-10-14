<template>
  <div class="tw-hidden lg:tw-flex lg:tw-flex-shrink-0">
    <div class="tw-flex tw-flex-col tw-w-64">
      <div
        class="tw-flex tw-flex-col tw-h-0 tw-flex-1 tw-shadow tw-bg-white dark:tw-bg-darkGray-800"
      >
        <SidebarCommon />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useSidebar } from 'src/hooks';
import SidebarCommon from './SidebarCommon.vue';

export default defineComponent({
  components: {
    SidebarCommon,
  },
  setup() {
    const { isOpen } = useSidebar();
    const activeClass = ref('tw-bg-gray-600 tw-bg-opacity-25 tw-text-gray-100 tw-border-gray-100');
    const inactiveClass = ref(
      'tw-border-gray-900 tw-text-gray-500 hover:tw-bg-gray-600 hover:tw-bg-opacity-25 hover:tw-text-gray-100'
    );

    return {
      isOpen,
      activeClass,
      inactiveClass,
    };
  },
});
</script>

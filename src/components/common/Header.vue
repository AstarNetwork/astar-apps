<template>
  <div
    class="tw-flex tw-justify-between tw-items-center lg:tw-hidden tw-px-4 tw-py-1 sm:tw-py-2 tw-bg-white dark:tw-bg-darkGray-800 tw-shadow"
  >
    <button
      class="tw--ml-3 tw-p-2 tw-rounded-full hover:tw-bg-blue-100 dark:hover:tw-bg-darkGray-600 hover:tw-text-gray-900 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 focus:tw-bg-blue-50 tw-group"
      @click="isOpen = true"
    >
      <span class="tw-sr-only">Open sidebar</span>
      <!-- Heroicon name: outline/menu -->
      <icon-base
        class="tw-h-6 tw-w-6 tw-text-gray-500 dark:tw-text-darkGray-300 group-hover:tw-text-blue-900"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <icon-outline-menu />
      </icon-base>
    </button>

    <div class="tw-flex tw-items-center tw-justify-center">
      <img width="200" src="~assets/img/astar.png" />
    </div>

    <button
      type="button"
      class="tw-w-8 tw-h-8 sm:tw-w-10 sm:tw-h-10 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100"
    >
      <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
        <icon-account-sample />
      </icon-base>
    </button>
  </div>
</template>

<script lang="ts">
import { useSidebar } from 'src/hooks';
import { defineComponent } from 'vue';
import IconBase from '../icons/IconBase.vue';
import IconOutlineMenu from '../icons/IconOutlineMenu.vue';
import IconAccountSample from '../icons/IconAccountSample.vue';

export default defineComponent({
  components: { IconBase, IconOutlineMenu, IconAccountSample },
  setup() {
    const { isOpen } = useSidebar();
    return {
      isOpen,
    };
  },
});
</script>

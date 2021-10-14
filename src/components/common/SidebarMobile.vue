<template>
  <!-- Off-canvas menu for mobile -->
  <div :class="isOpen ? 'tw-block' : 'tw-hidden'" class="lg:tw-hidden">
    <div class="tw-fixed tw-inset-0 tw-flex tw-z-40">
      <div class="tw-fixed tw-inset-0">
        <div class="tw-absolute tw-inset-0 tw-bg-gray-900 dark:tw-bg-black tw-opacity-75"></div>
      </div>
      <div
        class="
          tw-relative tw-flex-1 tw-flex tw-flex-col tw-max-w-xs tw-w-full tw-bg-white
          dark:tw-bg-darkGray-800
          tw-overflow-visible
        "
      >
        <div class="tw-absolute tw-top-0 tw-right-0 tw--mr-12 tw-pt-2">
          <button
            class="
              tw-ml-1 tw-flex tw-items-center tw-justify-center tw-h-10 tw-w-10 tw-rounded-full
              focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-white
            "
            @click="isOpen = false"
          >
            <span class="tw-sr-only">
              {{ $t('common.closeSidebar') }}
            </span>
            <!-- Heroicon name: outline/x -->
            <icon-base
              class="tw-h-6 tw-w-6 tw-text-white dark:tw-text-darkGray-300"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <icon-outline-x />
            </icon-base>
          </button>
        </div>
        <SidebarCommon />
      </div>
      <div class="tw-flex-shrink-0 tw-w-14">
        <!-- Force sidebar to shrink to fit close icon -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SidebarCommon from 'components/common/SidebarCommon.vue';
import { useSidebar } from 'src/hooks';
import IconBase from '../icons/IconBase.vue';
import IconOutlineX from '../icons/IconOutlineX.vue';

export default defineComponent({
  components: {
    SidebarCommon,
    IconBase,
    IconOutlineX,
  },
  setup() {
    const { isOpen } = useSidebar();
    return {
      isOpen,
    };
  },
});
</script>

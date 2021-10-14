<template>
  <div class="tw-h-screen tw-flex tw-overflow-hidden tw-bg-gray-50 dark:tw-bg-darkGray-900">
    <sidebar-desktop />
    <sidebar-mobile />
    <div class="tw-flex tw-flex-col tw-w-0 tw-flex-1 tw-overflow-y-auto lg:tw-overflow-hidden">
      <plasm-header />
      <main
        class="
          tw-flex-1 tw-relative tw-z-0
          lg:tw-overflow-y-auto
          tw-overflow-x-hidden
          focus:tw-outline-none
        "
      >
        <div class="tw-px-4 sm:tw-px-8 tw-py-10 lg:tw-py-16">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import PlasmHeader from 'components/common/Header.vue';
import SidebarDesktop from 'components/common/SidebarDesktop.vue';
import SidebarMobile from 'components/common/SidebarMobile.vue';

export default defineComponent({
  components: {
    PlasmHeader,
    SidebarMobile,
    SidebarDesktop,
  },
  setup() {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark
      ? document.documentElement.classList.add('dark')
      : document.documentElement.classList.remove('dark');
  },
});
</script>

<template>
  <div id="app--main" class="tw-h-screen tw-flex tw-overflow-hidden">
    <template v-if="width >= screenSize.lg">
      <sidebar-desktop />
    </template>
    <div class="tw-flex tw-flex-col tw-w-0 tw-flex-1 tw-overflow-y-auto lg:tw-overflow-hidden">
      <Header />
      <template v-if="screenSize.lg > width">
        <sidebar-mobile />
      </template>
      <main
        class="
          tw-flex-1 tw-relative tw-z-0
          lg:tw-py-12 lg:tw-overflow-y-auto
          tw-overflow-x-hidden
          focus:tw-outline-none
        "
      >
        <div class="tw-px-4 lg:tw-px-10 tw-py-5 lg:tw-py-14">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useBreakpoints, useGasPrice } from 'src/hooks';
import Header from 'src/components/header/Header.vue';
import SidebarDesktop from 'components/sidenav/SidebarDesktop.vue';
import SidebarMobile from 'components/sidenav/SidebarMobile.vue';

export default defineComponent({
  components: {
    Header,
    SidebarMobile,
    SidebarDesktop,
  },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark
      ? document.documentElement.classList.add('dark')
      : document.documentElement.classList.remove('dark');

    const isFetchGas = true;
    useGasPrice(isFetchGas);

    return {
      width,
      screenSize,
    };
  },
});
</script>

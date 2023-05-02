<template>
  <div id="app--main" class="tw-h-screen tw-flex tw-overflow-hidden">
    <template v-if="width >= screenSize.lg">
      <sidebar-desktop />
    </template>
    <div class="tw-flex tw-flex-col tw-w-0 tw-flex-1 tw-overflow-y-auto lg:tw-overflow-hidden">
      <portal-header />
      <template v-if="screenSize.lg > width">
        <sidebar-mobile />
      </template>
      <main
        id="assets-top"
        class="
          tw-flex-1 tw-relative tw-z-0
          lg:tw-py-12 lg:tw-overflow-y-auto
          tw-overflow-x-hidden
          focus:tw-outline-none
        "
      >
        <div class="wrapper--components">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect } from 'vue';
import { useBreakpoints, useGasPrice } from 'src/hooks';
import PortalHeader from 'src/components/header/Header.vue';
import SidebarDesktop from 'components/sidenav/SidebarDesktop.vue';
import SidebarMobile from 'components/sidenav/SidebarMobile.vue';
import { useQuasar } from 'quasar';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    PortalHeader,
    SidebarMobile,
    SidebarDesktop,
  },
  setup() {
    const store = useStore();
    const { width, screenSize } = useBreakpoints();
    const storedThemeColor = localStorage.getItem(LOCAL_STORAGE.THEME_COLOR);
    const isDark = storedThemeColor
      ? storedThemeColor === 'DARK'
      : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    const $q = useQuasar();
    $q.dark.set(isDark);

    watchEffect(() => {
      store.commit('general/setTheme', isDark ? 'DARK' : 'LIGHT');
    });

    const isFetchGas = true;
    useGasPrice(isFetchGas);

    return {
      width,
      screenSize,
    };
  },
});
</script>

<style lang="scss" scoped>
.wrapper--components {
  @media (min-width: $lg) {
    padding: 0 40px;
    padding-top: 12px;
  }
}
</style>

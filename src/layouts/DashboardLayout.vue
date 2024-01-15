<template>
  <div id="app--main" class="wrapper--dashboard-layout">
    <template v-if="width >= screenSize.lg">
      <sidebar-desktop />
    </template>
    <div class="wrapper--dashboard-layout__inner">
      <portal-header />
      <main id="assets-top" class="wrapper--main">
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
import { useQuasar } from 'quasar';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    PortalHeader,
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
.wrapper--dashboard-layout {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.wrapper--dashboard-layout__inner {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.wrapper--main {
  flex: 1;
  position: relative;
  padding: 0 0 120px 0;
  &:focus {
    outline: 0;
  }
  @media (min-width: $lg) {
    padding-top: 36px;
  }
}

.wrapper--components {
  @media (min-width: $lg) {
    padding: 0 40px;
  }
}

.body--dark {
  .wrapper--dashboard-layout__inner {
    background: $body-bg-dark;
  }
}
</style>

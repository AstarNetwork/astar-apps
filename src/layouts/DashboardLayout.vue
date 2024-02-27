<template>
  <div id="app--main" class="wrapper--dashboard-layout">
    <template v-if="width >= screenSize.lg">
      <sidebar-desktop />
    </template>
    <div class="wrapper--dashboard-layout__inner">
      <portal-header />
      <claim-warning-banner :network="currentNetworkIdx" />
      <main id="assets-top" class="wrapper--main">
        <div class="wrapper--components">
          <div class="page-bg" :style="{ backgroundImage: `url(${bg})` }" />

          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watchEffect, computed } from 'vue';
import { useBreakpoints, useGasPrice } from 'src/hooks';
import PortalHeader from 'src/components/header/Header.vue';
import SidebarDesktop from 'components/sidenav/SidebarDesktop.vue';
import { useQuasar } from 'quasar';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useStore } from 'src/store';
import ClaimWarningBanner from 'src/components/header/ClaimWarningBanner.vue';

export default defineComponent({
  components: {
    PortalHeader,
    SidebarDesktop,
    ClaimWarningBanner,
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

    const currentNetworkIdx = computed<number>(() => store.getters['general/networkIdx']);
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');

    const bg_img = {
      light: require('/src/assets/img/assets_bg_light.webp'),
      dark: require('/src/assets/img/assets_bg_dark_A.webp'),
    };

    const bg = computed<string>(() => {
      if (isDarkTheme.value) {
        return bg_img.dark;
      }
      return bg_img.light;
    });
    return {
      width,
      screenSize,
      currentNetworkIdx,
      bg,
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

  &:focus {
    outline: 0;
  }
}

.page-bg {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.body--dark {
  .wrapper--dashboard-layout__inner {
    background: $body-bg-dark;
  }
}
</style>

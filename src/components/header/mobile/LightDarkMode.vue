<template>
  <div class="wrapper--mobile-nav-theme">
    <button v-if="isDarkTheme" type="button" @click="switchThemeTo('LIGHT')">
      <astar-icon-base viewBox="0 0 24 24" stroke="currentColor" icon-color="none">
        <astar-icon-outline-sun />
      </astar-icon-base>
      {{ $t('common.lightTheme') }}
    </button>

    <button v-else type="button" @click="switchThemeTo('DARK')">
      <astar-icon-base viewBox="0 0 24 24" stroke="currentColor" icon-color="none">
        <astar-icon-outline-moon />
      </astar-icon-base>
      {{ $t('common.darkTheme') }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useStore } from 'src/store';
import { Theme } from 'src/store/general/state';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export default defineComponent({
  setup() {
    const store = useStore();
    const currentTheme = computed<string>(() => store.getters['general/theme']);
    const isDarkTheme = computed<boolean>(() => currentTheme.value === 'DARK');
    const $q = useQuasar();

    const switchThemeTo = (theme: Theme): void => {
      store.commit('general/setTheme', theme);
      localStorage.setItem(LOCAL_STORAGE.THEME_COLOR, theme);
    };

    watch(
      () => isDarkTheme,
      () => $q.dark.set(isDarkTheme.value)
    );

    return {
      currentTheme,
      isDarkTheme,
      switchThemeTo,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--mobile-nav-theme {
  button {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    width: 100%;
    height: 56px;
    color: $gray-2;
    font-weight: 600;
    font-size: 16px;
    gap: 8px;
    padding: 0 16px;
    svg {
      width: 20px;
      height: 20px;
    }
  }
}
</style>

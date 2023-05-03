<template>
  <div class="row--icons">
    <button type="button" @click="switchThemeTo('LIGHT')">
      <astar-icon-base
        :class="isDarkTheme ? 'icon' : 'icon--selected'"
        viewBox="0 0 24 24"
        stroke="currentColor"
        icon-color="none"
      >
        <astar-icon-outline-sun />
      </astar-icon-base>
    </button>

    <span class="text--slash">/</span>

    <button type="button" class="icon-dark" @click="switchThemeTo('DARK')">
      <astar-icon-base
        :class="isDarkTheme ? 'icon--selected' : 'icon'"
        viewBox="0 0 24 24"
        stroke="currentColor"
        icon-color="none"
      >
        <astar-icon-outline-moon />
      </astar-icon-base>
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
      isDarkTheme,
      switchThemeTo,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.text--slash {
  color: $gray-1;
  opacity: 0.4;
}

.row--icons {
  display: flex;
  column-gap: 6px;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon--selected {
  width: 20px;
  height: 20px;
  cursor: default;
  stroke: $gray-1;
  opacity: 0.4;
}

.icon {
  width: 20px;
  height: 20px;
  stroke: $gray-1;
  cursor: pointer;
}
</style>

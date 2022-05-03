<template>
  <div class="tw-flex tw-items-center">
    <button
      type="button"
      class="icon-light"
      :class="{ 'tw-cursor-default': !isDarkTheme }"
      @click="switchThemeTo('LIGHT')"
    >
      <astar-icon-base
        class="tw-h-5 tw-w-5 tw-text-gray-300 dark:tw-text-gray-300 dark:tw-text-darkGray-500"
        viewBox="0 0 24 24"
        stroke="currentColor"
        icon-color="none"
      >
        <astar-icon-outline-sun />
      </astar-icon-base>
    </button>

    <span class="tw-text-gray-400 dark:tw-text-darkGray-500">/</span>

    <button type="button" class="icon-dark" @click="switchThemeTo('DARK')">
      <astar-icon-base
        class="icon-outline-moon"
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

export default defineComponent({
  setup() {
    const store = useStore();
    const currentTheme = computed(() => store.getters['general/theme']);
    const isDarkTheme = currentTheme.value == 'DARK';
    const $q = useQuasar();

    watch(
      () => isDarkTheme,
      () => $q.dark.set(isDarkTheme)
    );

    return {
      isDarkTheme,
      switchThemeTo(theme: Theme) {
        store.commit('general/setTheme', theme);
      },
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.icon-light {
  @apply tw-p-2 tw-rounded-full tw-relative;
}

.icon-dark {
  @apply tw-p-2 tw-rounded-full tw-relative;
}

.icon-outline-moon {
  color: $gray-4;
  @apply tw-h-5 tw-w-5 dark:tw-text-darkGray-100;
}
</style>

<template>
  <div class="tw-flex tw-items-center">
    <button
      type="button"
      class="icon-light"
      :class="{ 'tw-cursor-default': !isDarkTheme }"
      @click="switchThemeTo('LIGHT')"
    >
      <icon-base
        class="tw-h-5 tw-w-5 tw-text-white dark:tw-text-gray-300 dark:tw-text-darkGray-500"
        viewBox="0 0 24 24"
        stroke="currentColor"
        icon-color="none"
      >
        <icon-outline-sun />
      </icon-base>
    </button>

    <span class="tw-text-gray-400 dark:tw-text-darkGray-500">/</span>

    <button type="button" class="icon-dark" @click="switchThemeTo('DARK')">
      <icon-base
        class="icon-outline-moon"
        viewBox="0 0 24 24"
        stroke="currentColor"
        icon-color="none"
      >
        <icon-outline-moon />
      </icon-base>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useStore } from 'src/store';
import { Theme } from 'src/store/general/state';
import IconBase from '../icons/IconBase.vue';
import IconOutlineSun from '../icons/IconOutlineSun.vue';
import IconOutlineMoon from '../icons/IconOutlineMoon.vue';

export default defineComponent({
  components: { IconBase, IconOutlineSun, IconOutlineMoon },
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

<style scoped>
.icon-light {
  @apply tw-p-2 tw-rounded-full tw-relative;
}

.icon-dark {
  @apply tw-p-2 tw-rounded-full tw-relative;
}

.icon-outline-moon {
  color: #5f656f;
  @apply tw-h-5 tw-w-5 dark:tw-text-darkGray-100;
}
</style>

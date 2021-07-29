<template>
  <div class="tw-flex tw-items-center">
    <button
      type="button"
      class="tw-tooltip tw-p-3 tw-rounded-full tw-relative focus:tw-z-10 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 focus:tw-bg-blue-50 dark:hover:tw-bg-darkGray-600 dark:focus:tw-ring-darkGray-600 dark:focus:tw-bg-darkGray-900"
      :class="{ 'tw-cursor-default': !isDarkTheme }"
      @click="switchThemeTo('LIGHT')"
    >
      <!-- Heroicon name: outline/sun -->
      <icon-base
        class="tw-h-5 tw-w-5 tw-text-blue-900 dark:tw-text-gray-300 dark:tw-text-darkGray-500"
        viewBox="0 0 24 24"
        stroke="currentColor"
        iconColor="none"
      >
        <icon-outline-sun />
      </icon-base>
      <!-- Tooltip -->
      <span
        class="tw-pointer-events-none tw-hidden tw-absolute tw-top-0 tw-left-1/2 z-10 tw-transform tw--translate-y-full tw--translate-x-1/2 tw-p-2 tw-text-xs tw-leading-tight tw-text-white tw-bg-gray-800 dark:tw-bg-darkGray-500 tw-rounded-md tw-shadow-lg tw-opacity-90 tw-whitespace-nowrap"
      >
        Light mode
      </span>
    </button>

    <span class="tw-text-gray-300 dark:tw-text-darkGray-500">/</span>

    <button
      type="button"
      class="tw-tooltip tw-p-3 tw-rounded-full focus:tw-z-10 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 focus:tw-bg-blue-50 tw-relative tw-group dark:tw-ring-darkGray-600 dark:focus:tw-bg-darkGray-900"
      :class="[isDarkTheme ? 'tw-cursor-default' : 'hover:tw-bg-gray-100']"
      @click="switchThemeTo('DARK')"
    >
      <!-- Heroicon name: outline/moon -->
      <icon-base
        class="tw-h-5 tw-w-5 tw-group-hover:text-blue-900 tw-text-gray-300 dark:group-hover:tw-text-darkGray-300 dark:tw-text-darkGray-100"
        viewBox="0 0 24 24"
        stroke="currentColor"
        iconColor="none"
      >
        <icon-outline-moon />
      </icon-base>
      <!-- Tooltip -->
      <span
        class="tw-pointer-events-none tw-hidden tw-absolute tw-top-0 tw-left-1/2 tw-z-10 tw-transform tw--translate-y-full tw--translate-x-1/2 tw-p-2 tw-text-xs tw-leading-tight tw-text-white tw-bg-gray-800 dark:tw-bg-darkGray-500 tw-rounded-md tw-shadow-lg tw-opacity-90 tw-whitespace-nowrap"
      >
        Dark mode
      </span>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
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

    return {
      isDarkTheme: currentTheme.value == 'DARK',
      switchThemeTo(theme: Theme) {
        store.commit('general/setTheme', theme);
      },
    };
  },
});
</script>

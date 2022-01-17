<template>
  <div class="tw-flex tw-items-center">
    <button
      type="button"
      class="icon-light tw-tooltip"
      :class="{ 'tw-cursor-default': !isDarkTheme }"
      @click="switchThemeTo('LIGHT')"
    >
      <!-- Heroicon name: outline/sun -->
      <icon-base
        class="tw-h-5 tw-w-5 tw-text-blue-900 dark:tw-text-gray-300 dark:tw-text-darkGray-500"
        viewBox="0 0 24 24"
        stroke="currentColor"
        icon-color="none"
      >
        <icon-outline-sun />
      </icon-base>
      <!-- Tooltip -->
      <span
        class="
          tw-pointer-events-none tw-hidden tw-absolute tw-top-0 tw-left-1/2
          z-10
          tw-transform
          tw--translate-y-full
          tw--translate-x-1/2
          tw-p-2
          tw-text-xs
          tw-leading-tight
          tw-text-white
          tw-bg-gray-800
          dark:tw-bg-darkGray-500
          tw-rounded-md tw-shadow-lg tw-opacity-90 tw-whitespace-nowrap
        "
      >
        {{ $t('common.lightMode') }}
      </span>
    </button>

    <span class="tw-text-gray-300 dark:tw-text-darkGray-500">/</span>

    <button
      type="button"
      class="icon-dark tw-tooltip"
      :class="darkIconHoverClass"
      @click="switchThemeTo('DARK')"
    >
      <!-- Heroicon name: outline/moon -->
      <icon-base
        class="icon-outline-moon"
        viewBox="0 0 24 24"
        stroke="currentColor"
        icon-color="none"
      >
        <icon-outline-moon />
      </icon-base>
      <!-- Tooltip -->
      <span
        class="
          tw-pointer-events-none
          tw-hidden
          tw-absolute
          tw-top-0
          tw-left-1/2
          tw-z-10
          tw-transform
          tw--translate-y-full
          tw--translate-x-1/2
          tw-p-2
          tw-text-xs
          tw-leading-tight
          tw-text-white
          tw-bg-gray-800
          dark:tw-bg-darkGray-500
          tw-rounded-md tw-shadow-lg tw-opacity-90 tw-whitespace-nowrap
        "
      >
        {{ $t('common.darkMode') }}
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
    const darkIconHoverClass = computed(() =>
      store.getters['general/theme'] === 'DARK' ? 'tw-cursor-default' : 'icon-dark-h'
    );
    const isDarkTheme = currentTheme.value == 'DARK';

    return {
      isDarkTheme,
      darkIconHoverClass,
      switchThemeTo(theme: Theme) {
        store.commit('general/setTheme', theme);
      },
    };
  },
});
</script>

<style scoped>
.icon-light {
  @apply tw-p-3 tw-rounded-full tw-relative;
}
.icon-light:hover {
  @apply dark:tw-bg-darkGray-600;
}
.icon-light:focus {
  @apply tw-z-10 tw-outline-none tw-ring tw-ring-gray-100 tw-bg-blue-50 dark:tw-ring-darkGray-600 dark:tw-bg-darkGray-900;
}

.icon-dark {
  @apply tw-p-3 tw-rounded-full tw-relative dark:tw-ring-darkGray-600;
}

.icon-dark-h:hover {
  @apply tw-bg-gray-100 tw-cursor-pointer;
}

.icon-dark:focus {
  @apply tw-z-10 tw-outline-none tw-ring tw-ring-gray-100 tw-bg-blue-50 dark:tw-bg-darkGray-900;
}

.icon-outline-moon {
  @apply tw-h-5 tw-w-5 group-hover:tw-text-blue-900 tw-text-gray-300 dark:tw-text-darkGray-100;
}
.icon-outline-moon:group-hover {
  @apply dark:tw-text-darkGray-300;
}
</style>

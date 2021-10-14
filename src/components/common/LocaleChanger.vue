<template>
  <div
    class="
      tw-relative tw-inline-block tw-border tw-border-gray-300
      dark:tw-border-darkGray-600
      tw-rounded-lg tw-bg-white
      dark:tw-bg-darkGray-900
    "
  >
    <select v-model="$i18n.locale" class="select-language" placeholder="Regular input">
      <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang.code">
        {{ lang.text }}
      </option>
    </select>

    <div
      class="
        tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-px-2 tw-pointer-events-none
        dark:tw-text-darkGray-100
      "
    >
      <svg class="tw-w-4 tw-h-4 tw-fill-current" viewBox="0 0 20 20">
        <path
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
          fill-rule="evenodd"
        ></path>
      </svg>
    </div>
  </div>
</template>

<script>
import { languagesSelector } from 'src/i18n';
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return { langs: languagesSelector };
  },
});
</script>

<style scoped>
.dropdown:hover .dropdown-menu {
  display: block;
}
.select-language {
  @apply tw-w-full tw-h-8 tw-pl-3 tw-pr-6 tw-text-sm tw-rounded-lg tw-appearance-none tw-bg-white dark:tw-bg-darkGray-900 tw-font-medium tw-text-gray-700 dark:tw-text-darkGray-100 tw-cursor-pointer;
}
.select-language:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.select-language:focus {
  @apply tw-outline-none;
}
</style>

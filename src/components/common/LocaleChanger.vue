<template>

  <div
    class="tw-px-1.5 tw-rounded-lg tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-bg-white dark:tw-bg-darkGray-900"
  >
    <select
      class="tw-justify-center tw-px-1 tw-py-1.5 tw-bg-white dark:tw-bg-darkGray-900 tw-text-xs tw-font-medium tw-text-gray-700 dark:tw-text-darkGray-100 tw-cursor-pointer focus:tw-outline-none"
      v-model="$i18n.locale"
    >
      <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang.code">{{ lang.text }}</option>
    </select>
  </div>
</template>

<script>
import { languagesSelector } from 'src/i18n';
import { defineComponent } from 'vue'

export default defineComponent({
  data () {
    return { langs: languagesSelector}
  }
});
</script>
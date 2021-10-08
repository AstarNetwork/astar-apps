<template>
    <select v-model="$i18n.locale" class="tw-inline-flex tw-justify-center tw-rounded-lg tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-px-1 tw-py-1.5 tw-bg-white dark:tw-bg-darkGray-900 tw-text-xs tw-font-medium tw-text-gray-700 dark:tw-text-darkGray-100 hover:tw-bg-gray-100 dark:hover:tw-bg-darkGray-700 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600 tw-cursor-pointer">
      <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang.code">{{ lang.text }}</option>
    </select>
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
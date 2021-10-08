<template>
    <select v-model="$i18n.locale" class="tw-rounded-md ">
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
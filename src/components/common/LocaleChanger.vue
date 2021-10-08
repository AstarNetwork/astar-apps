<template>
  <div class="locale-changer">
    <select v-model="$i18n.locale">
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
<template>
  <div class="wrapper--mobile-nav-locale-changer">
    <q-select
      v-model="selectedLang"
      filled
      :options="langs"
      option-value="code"
      option-label="text"
      :hide-dropdown-icon="false"
    >
      <template #append>
        <astar-icon-expand />
      </template>
    </q-select>
  </div>
</template>

<script lang="ts">
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { languagesSelector } from 'src/i18n';
import { defineComponent, watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  data() {
    const { locale } = useI18n();
    const selectedLang = ref(languagesSelector[0]);

    watch(
      [locale],
      () => {
        selectedLang.value =
          languagesSelector.find((lang) => lang.code === locale.value) || languagesSelector[0];
      },
      { immediate: true }
    );

    watch(
      [selectedLang],
      () => {
        locale.value = selectedLang.value.code;
        localStorage.setItem(LOCAL_STORAGE.SELECTED_LANGUAGE, locale.value);
      },
      { immediate: false }
    );

    return { langs: languagesSelector, selectedLang };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.dropdown:hover .dropdown-menu {
  display: block;
}

.wrapper--mobile-nav-locale-changer {
  .q-select {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
  }
}
</style>

<style lang="scss">
.wrapper--mobile-nav-locale-changer {
  .q-field__native {
    color: $gray-2 !important;
    font-weight: 600;
  }
  .q-field__append {
    color: $gray-2;
  }
}
</style>

<template>
  <q-select
    v-model="selectedLang"
    filled
    :options="langs"
    option-value="code"
    option-label="text"
    :hide-dropdown-icon="false"
  >
    <template #append>
      <q-icon name="language" />
    </template>
  </q-select>
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
.select-language {
  background: #d3d6dc;
  color: $navy-1;
  width: 100%;
  height: 36px;
  padding-left: 15px;
  appearance: none;
  border-radius: 6px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}
.icon--select {
  color: $navy-1;
}

@media (max-width: 768px) {
  .select-language {
    background: #fff;
  }
}
</style>

<style lang="scss">
.q-select {
  font-size: 16px;
}

.q-menu {
  font-size: 16px;
}

.q-field__native {
  color: $gray-1;
}

.q-icon {
  color: $gray-4;
}
</style>

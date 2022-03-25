<template>
  <div class="tw-relative tw-inline-block tw-rounded-lg tw-bg-black">
    <select v-model="$i18n.locale" class="select-language" placeholder="Regular input">
      <option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="lang.code">
        {{ lang.text }}
      </option>
    </select>

    <div
      class="
        icon--select
        tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-px-2 tw-pointer-events-none
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

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.dropdown:hover .dropdown-menu {
  display: block;
}
.select-language {
  background: #d3d6dc;
  color: $gray-5;
  width: 95px;
  height: 36px;
  padding-left: 15px;
  appearance: none;
  border-radius: 6px;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
}
.icon--select {
  color: $gray-5;
}

.body--dark {
  .select-language {
    background: $gray-6;
    color: $gray-1;
  }
  .icon--select {
    color: $gray-1;
  }
}
</style>

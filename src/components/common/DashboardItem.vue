<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-shadow tw-m-4 tw-rounded-lg tw-text-blue-900
      dark:tw-text-darkGray-100
      tw-p-4
    "
  >
    <div class="tw-text-center tw-font-semibold tw-text-2xl tw-my-1">{{ value }}</div>
    <div class="tw-text-center">{{ caption }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

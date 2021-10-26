<template>
  <div class="tw-mx-4 tw-mb-2">
    <div class="tw-text-center tw-font-semibold tw-text-xl tw-my-1">{{ value }}</div>
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

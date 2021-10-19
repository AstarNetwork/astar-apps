<template>
  <div
    class="
      tw-w-14
      tw-h-8
      tw-flex
      tw-items-center
      tw-bg-gray-300
      tw-rounded-full
      tw-p-1
      tw-duration-300
      tw-cursor-pointer
    "
    :class="{ 'tw-bg-blue-500 dark:tw-bg-blue-600': value }"
    :aria-checked="value.toString()"
    @click="toggle"
  >
    <div
      class="tw-bg-white tw-w-6 tw-h-6 tw-rounded-full tw-shadow-md tw-transform tw-duration-300"
      :class="{ 'tw-translate-x-6': value }"
    ></div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },

  emits: ['toggle-action'],
  setup(props, { emit }) {
    const toggle = () => {
      emit('toggle-action');
    };

    return {
      toggle,
    };
  },
});
</script>

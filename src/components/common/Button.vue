<template>
  <button
    type="button"
    :class="[
      'tw-inline-flex',
      'tw-items-center',
      small ? 'tw-px-3' : 'tw-px-6',
      small ? 'tw-py-1' : 'tw-py-3',
      'tw-border',
      primary ? 'tw-border-transparent' : 'tw-border-gray-300',
      'tw-text-sm',
      'tw-font-medium',
      'tw-rounded-full',
      'tw-shadow-sm',
      primary ? 'tw-text-white' : 'tw-text-gray-500',
      primary ? 'tw-bg-blue-500' : 'tw-bg-white',
      primary ? 'hover:tw-bg-blue-700' : 'hover:tw-bg-gray-100',
      primary ? 'dark-bg-blue' : 'dark:tw-bg-darkGray-900',
      'focus:tw-outline-none',
      'focus:tw-ring',
      primary ? 'focus:tw-ring-blue-100' : 'focus:tw-ring-gray-100',
      primary ? 'dark-ring-blue' : 'dark-ring-dark-gray',
      'tw-mx-1',
    ]"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  props: {
    small: {
      type: Boolean,
      default: false,
    },
    primary: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<style scoped>
.dark-bg-blue:hover {
  @apply dark:tw-bg-blue-400;
}
.dark-ring-blue:focus {
  @apply dark:tw-ring-blue-400;
}
.dark-ring-dark-gray:focus {
  @apply dark:tw-ring-darkGray-600;
}
</style>

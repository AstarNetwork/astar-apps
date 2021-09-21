<template>
  <button
    type="button"
    v-bind:class="[
      'tw-inline-flex',
      'tw-items-center',
      'tw-px-6',
      small ? 'tw-py-1' : 'tw-py-3',
      'tw-border',
      'tw-border-transparent',
      'tw-text-sm',
      'tw-font-medium',
      'tw-rounded-full',
      'tw-shadow-sm',
      'tw-text-white', 
      'tw-bg-blue-500', 
      'hover:tw-bg-blue-700',
      'dark:hover:tw-bg-blue-400',
      'focus:tw-outline-none',
      'focus:tw-ring',
      'focus:tw-ring-blue-100',
      'dark:focus:tw-ring-blue-400',
      'tw-mx-1'
    ]"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue'

export default defineComponent({
  props: {
    small: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    return {
      ...toRefs(props)
    };
  },
})
</script>


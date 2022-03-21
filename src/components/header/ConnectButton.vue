<template>
  <button
    type="button"
    :class="[
      'connect-btn',
      'tw-inline-flex',
      'tw-items-center',
      'tw-px-4',
      'tw-py-1',
      'tw-border',
      'tw-border-transparent',
      'tw-text-sm',
      'tw-font-medium',
      'tw-rounded-full',
      'tw-shadow-sm',
      'tw-text-white',
      'tw-bg-gray-500',
      'hover:tw-bg-gray-500',
      'focus:tw-outline-none',
      'focus:tw-ring',
      'focus:tw-ring-gray-100',
      'dark-ring-dark-gray',
      'tw-mx-1',
    ]"
  >
    <icon-base
      class="tw-w-5 tw-h-5 tw-text-astarblue tw--ml-1"
      stroke="currentColor"
      icon-name="plus"
    >
      <icon-plus />
    </icon-base>
    Connect
  </button>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import IconBase from 'components/icons/IconBase.vue';
import IconPlus from 'components/icons/IconPlus.vue';

export default defineComponent({
  components: {
    IconBase,
    IconPlus,
  },
  props: {},
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<style scoped>
.connect-btn {
  background: #2c3335;
}
.connect-btn:hover {
  background: #3c4649;
}
</style>

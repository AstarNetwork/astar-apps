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
    <icon-base class="tw-w-5 tw-h-5 tw-text-white tw--ml-1" stroke="currentColor" icon-name="plus">
      <icon-plus />
    </icon-base>
    Metadata Update
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
  background: #ff5621;
}
.connect-btn:hover {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #ff5621;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
}
</style>

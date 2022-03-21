<template>
  <button
    type="button"
    :class="[
      'network-btn',
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
      class="tw-w-5 tw-h-5 tw-text-gray-500 tw--ml-1"
      stroke="currentColor"
      icon-name="plus"
    >
      <icon-plus />
    </icon-base>
    <img class="tw-mx-1" width="16" src="~assets/img/ethereum.png" />
    {{ network }}

    <div class="divider tw-mx-2 tw-h-5" />
    <ConnectionIndicator :version="version" />
  </button>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import IconBase from 'components/icons/IconBase.vue';
import IconPlus from 'components/icons/IconPlus.vue';
import ConnectionIndicator from 'components/header/ConnectionIndicator.vue';

export default defineComponent({
  components: {
    IconBase,
    IconPlus,
    ConnectionIndicator,
  },
  props: {
    network: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const version = '0.0.0';

    return {
      version,
      ...toRefs(props),
    };
  },
});
</script>

<style scoped>
.network-btn {
  background: #2c3335;
}
.network-btn:hover {
  /* gray005 selected */
  background: #3c4649;
  /* gray basic */
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
}
.divider {
  border: 1px solid #000;
}
</style>

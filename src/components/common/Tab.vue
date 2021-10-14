<template>
  <nav class="tw--mb-px tw-flex tw-justify-items-center sm:tw-ml-8 md:tw-ml-0" aria-label="Tabs">
    <router-link
      v-for="num in labelsNumArray"
      :key="num"
      append
      :to="{ path: labels[num].path }"
      :class="[active === labels[num].path ? activeLinkClass : inactiveLinkClass]"
    >
      <span :class="[active === labels[num].path ? activeSpanClass : inactiveSpanClass]">
        {{ labels[num].label }}
      </span>
    </router-link>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  props: {
    labels: {
      type: Array as PropType<Array<{ label: string; path: string }>>,
      required: true,
    },
  },

  setup(props) {
    const route = useRoute();
    // when `route.path` is `/dapps/dapps-staking`, `active` is `dapps-staking`.
    const active = computed(() => route.path.split('/')[2]);
    const classes = reactive({
      activeLinkClass: 'tw-border-gray-200 dark:tw-border-darkGray-600 tw-border tw-rounded-t-md',
      inactiveLinkClass: 'tw-border-gray-50 dark:tw-border-darkGray-900 tw-border tw-rounded-t-md',
      activeSpanClass:
        'tw-block tw-bg-gray-50 dark:tw-bg-darkGray-900 tw--mb-px tw-whitespace-nowrap tw-py-3 sm:tw-py-5 tw-px-6 md:tw-px-8 tw-text-blue-900 dark:tw-text-darkGray-300 tw-font-medium tw-rounded-t-md tw-border-gray-50 dark:tw-border-darkGray-900 tw-border-b',
      inactiveSpanClass: 'inactive-span-class',
    });
    const labelsNumArray = computed(() => [...Array(props.labels.length).keys()]);
    return {
      labelsNumArray,
      active,
      ...props,
      ...classes,
    };
  },
});
</script>

<style scoped>
.inactive-span-class {
  @apply tw-block tw-bg-gray-50 dark:tw-bg-darkGray-900 tw--mb-px tw-whitespace-nowrap tw-py-3 sm:tw-py-5 tw-px-6 md:tw-px-8 tw-text-blue-500 dark:tw-text-blue-400 tw-font-medium tw-rounded-t-md tw-border-gray-200 dark:tw-border-darkGray-600 tw-border-b;
}
.inactive-span-class:hover {
  @apply tw-text-blue-400 dark:tw-text-blue-300;
}
</style>

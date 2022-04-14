<template>
  <div class="wrapper--filter">
    <div class="filter--tabs">
      <div
        v-for="filter in availableFilters"
        :key="filter"
        :class="{ selected: filter === selected }"
        class="text--filter"
        @click="selectFilter(filter)"
      >
        {{ filter }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export const DEFAULT_FILTER = '7 days';
export default defineComponent({
  props: {
    rangeFilter: {
      type: String,
      default: DEFAULT_FILTER,
    },
  },
  emits: ['filterChanged'],
  setup(props, { emit }) {
    const availableFilters = ref<string[]>(['7 days', '30 days', '90 days', '1 year']);
    const selected = ref<string>('');

    const selectFilter = (filter: string): void => {
      if (selected.value !== filter) {
        selected.value = filter;
        emit('filterChanged', filter);
      }
    };

    selectFilter(props.rangeFilter);

    return {
      selected,
      availableFilters,
      selectFilter,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';
</style>

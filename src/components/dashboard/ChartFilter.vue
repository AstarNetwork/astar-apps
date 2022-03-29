<template>
  <div class="wrapper--filter">
    <div class="filter--tabs">
      <div
        v-for="filter in availableFilters"
        :key="filter"
        :class="{ selected: filter === selected }"
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
  emits: ['filterChanged'],
  setup(_, { emit }) {
    const availableFilters = ref<string[]>([DEFAULT_FILTER, '30 days', '90 days', '1 year']);
    const selected = ref<string>('');

    const selectFilter = (filter: string): void => {
      selected.value = filter;
      emit('filterChanged', filter);
    };

    selectFilter(DEFAULT_FILTER);

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
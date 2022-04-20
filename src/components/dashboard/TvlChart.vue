<template>
  <chart-panel
    :data="tvlData"
    :merged-data="mergedTvlData"
    :title="title"
    :tooltip="tooltip"
    :default-value="tvlValue"
    class="wrapper--chart"
    :is-multiple-line="isMultipleLine"
    @filter-changed="handleFilterChanged"
  />
</template>

<script lang="ts">
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    ChartPanel,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    tooltip: {
      type: String,
      required: true,
    },
    tvlValue: {
      type: Array,
      required: true,
    },
    tvlData: {
      type: Array,
      required: true,
    },
    mergedTvlData: {
      type: Array,
      required: true,
    },
    handleFilterChanged: {
      type: Function,
      required: true,
    },
    isMultipleLine: {
      type: Boolean,
      required: true,
    },
  },
});
</script>

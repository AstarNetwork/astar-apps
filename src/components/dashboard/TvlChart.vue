<template>
  <chart-panel
    :data="tvlData"
    :merged-data="mergedTvlData"
    :title="title || ''"
    :tooltip="tooltip"
    :default-value="tvlValue"
    :default-value-add-on="tvlValueAddOn"
    class="wrapper--chart"
    :is-multiple-line="isMultipleLine"
    :second-value="secondValue"
    :is-price="true"
    @filter-changed="handleFilterChanged"
  />
</template>

<script lang="ts">
import ChartPanel from 'src/components/common/ChartPanel.vue';
import { defineComponent, PropType } from 'vue';

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
      type: String,
      required: true,
    },
    tvlValueAddOn: {
      type: String,
      default: '',
    },
    secondValue: {
      type: String,
      required: false,
      default: '',
    },
    tvlData: {
      type: Array as PropType<number[][] | null>,
      required: false,
      default: null,
    },
    mergedTvlData: {
      type: Array as PropType<number[][] | null>,
      required: false,
      default: null,
    },
    handleFilterChanged: {
      type: Function,
      required: true,
    },
    isMultipleLine: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
});
</script>

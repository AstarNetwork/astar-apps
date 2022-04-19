<template>
  <chart-panel
    :data="tvlData"
    :title="title"
    :default-value="tvlValue"
    class="wrapper--chart"
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
    tvlValue: {
      type: String,
      required: true,
    },
    tvlData: {
      type: String,
      required: true,
    },
    handleFilterChanged: {
      type: Function,
      required: true,
    },
  },
});
</script>

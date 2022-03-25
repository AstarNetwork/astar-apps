<template>
  <div class="wrapper--chart">
    <div class="container">
      <div class="row">
        <span class="text--md">{{ title }}</span>
      </div>
      <div class="row align-rigth text--xlg">{{ value }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  setup(props) {},
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/chart-panel.scss';
</style>

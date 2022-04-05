<template>
  <div class="wrapper--value">
    <div class="container container--value">
      <div class="row">
        <span class="text--accent container--title--color">{{ title }}</span>
      </div>
      <div class="align-right text--xlg">
        <span v-if="value">
          {{ value }}
        </span>
        <div v-else class="skeleton--right">
          <q-skeleton animation="fade" class="skeleton--lg" />
        </div>
      </div>
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

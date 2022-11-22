<template>
  <div v-if="!value">
    <q-skeleton class="skeleton--value-panel" />
  </div>
  <div v-else class="wrapper--value">
    <div class="container container--value">
      <div class="row">
        <span class="text--accent container--title--color">{{ title }}</span>
      </div>
      <div class="align-right text--xlg">
        <span class="text--value text-color--neon">
          {{ value }}
        </span>
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
@use 'src/components/dashboard/styles/dashboard.scss';
</style>

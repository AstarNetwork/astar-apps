<template>
  <div class="wrapper--kpi-card">
    <div class="card--inner">
      <div class="card--front">
        <div class="card__top">
          <span class="text--card-title">{{ title }}</span>
        </div>
        <div class="card__bottom">
          <slot />
        </div>
      </div>
      <div class="card--back">
        <div>{{ description }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { title } from 'process';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
<style lang="scss" scoped>
@use './styles/feature-dapp.scss';
</style>

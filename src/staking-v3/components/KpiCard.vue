<template>
  <div class="promo__data">
    <div class="card--data">
      <div class="card__top">
        <span class="text--card-title">{{ title }}</span>
      </div>
      <div class="card__bottom">
        <span class="text--value"><slot></slot></span>
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
  },
  setup() {
    return {};
  },
});
</script>
<style lang="scss" scoped>
@use './styles/feature-dapp.scss';
</style>

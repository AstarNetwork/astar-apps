<template>
  <div class="wrapper--value" data-testid="burn-status">
    <div class="container container--value">
      <div class="row--title">
        <span class="text--accent container--title--color"> Burn </span>
        <span class="text--accent container--title--color"> Coming Soon </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {},
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/burn.scss';
</style>

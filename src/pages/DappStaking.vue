<template>
  <div class="wrapper--assets">
    <div class="container--assets">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>

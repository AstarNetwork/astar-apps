<template>
  <div class="container--back">
    <router-link to="/assets">
      <span class="icon--back"> &#60; </span>
      <span>Back to Assets</span>
    </router-link>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/back-to-asset.scss';
</style>

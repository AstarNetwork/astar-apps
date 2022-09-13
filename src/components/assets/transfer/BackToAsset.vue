<template>
  <div class="container--back">
    <router-link :to="Path.Assets">
      <span class="icon--back"> &#60; </span>
      <span> {{ $t('assets.transferPage.backToAssets') }}</span>
    </router-link>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { Path } from 'src/router';

export default defineComponent({
  setup() {
    return { Path };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/back-to-asset.scss';
</style>

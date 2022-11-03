<template>
  <div class="container--back">
    <router-link :to="link">
      <span class="icon--back"> &#60; </span>
      <span> {{ text }}</span>
    </router-link>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { Path } from 'src/router';

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  setup() {
    return { Path };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/back-to-page.scss';
</style>

<template>
  <div class="link-wrapper">
    <a :href="url" target="_blank" rel="noopener noreferrer">{{ title }}</a>
    <div><astar-icon-arrow-right /></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    index: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.link-wrapper {
  display: flex;
  color: $astar-blue;
  align-items: center;
  gap: 8px;
}

a {
  color: $astar-blue;
}
</style>

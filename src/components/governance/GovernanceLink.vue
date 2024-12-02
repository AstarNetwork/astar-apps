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
  max-height: 80px;
}

a {
  color: $astar-blue;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 4.5em;
  line-height: 1.5em;
}
</style>

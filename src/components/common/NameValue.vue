<!--
  A component used to display label and some content. Label is a text describing content,
  while content can be any html element or Vue component.
-->
<template>
  <div class="container tw-w-full">
    <div class="item">{{ label }}</div>
    <div class="item">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
}

.item {
  flex-grow: 1;
  flex-basis: 0;
}
</style>
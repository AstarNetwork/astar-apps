<template>
  <div class="container items-container">
    <div v-if="title" class="title">{{ title }}</div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';

.container {
  padding-left: 12px;
}

.items-container {
  transition: background-color 0.5s;
}

.items-container:hover {
  background-color: $gray-5-selected;
}

.container.div {
  cursor: pointer;
}

.title {
  font-size: 12px;
}
</style>

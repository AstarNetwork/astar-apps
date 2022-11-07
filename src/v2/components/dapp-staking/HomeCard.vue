<template>
  <div class="header-card">
    <div class="header-card-title">{{ title }}</div>
    <div>{{ value }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    toolTip: {
      type: String,
      default: undefined,
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
.header-card {
  flex-basis: 0;
  flex: 1 0 0px;
  border: 1px solid lightgray;
  border-radius: 4px;
  padding: 8px;
}

.header-card-title {
  font-size: 14px;
  font-weight: bold;
}
</style>

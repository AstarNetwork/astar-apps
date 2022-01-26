<template>
  <div @click="selectChain(chain.id)">
    {{ chain.name }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    selectChain: {
      type: Function,
      required: true,
    },
    chain: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped></style>

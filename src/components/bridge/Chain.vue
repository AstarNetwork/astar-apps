<template>
  <div class="chain" @click="selectChain(chain.id)">
    <div>
      <img :src="chain.icon" alt="chain-logo" class="chain-logo" />
    </div>
    <div>
      {{ chain.name }}
    </div>
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
    selectedChain: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import './styles/modal';
</style>

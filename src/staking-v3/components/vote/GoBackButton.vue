<template>
  <button class="go-back" @click="$emit('click')">
    <div class="go-back-container">
      <astar-icon-arrow-left />
      <slot></slot>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  emits: ['click'],
});
</script>

<style scoped lang="scss">
.go-back {
  padding-right: 24px;
  padding-left: 8px;
  border-radius: 100px;
  border: 1px solid $navy-1;
  background: $white;
}

.go-back-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-weight: 600;
}
</style>

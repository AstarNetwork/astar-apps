<template>
  <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    errorMessage: {
      type: String,
      required: false,
      default: '',
    },
  },
});
</script>

<style lang="scss" scoped>
.error {
  border-radius: 16px;
  border: 1px solid $warning-red;
  background: $box-red;
  padding: 16px;
  color: $white;
  font-size: 14px;
  font-weight: 500;
}
</style>
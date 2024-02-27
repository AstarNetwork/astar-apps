<template>
  <div>
    <div v-if="errorMessage" class="error">
      {{ errorMessage }}
      <a v-if="url" :href="url" target="_blank" rel="noopener noreferrer" class="text--link">
        {{ $t('common.checkHowToSolve') }}
      </a>
    </div>
  </div>
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
    url: {
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

.text--link {
  text-decoration: underline;
}
</style>

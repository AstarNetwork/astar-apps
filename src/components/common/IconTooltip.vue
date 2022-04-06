<template>
  <div class="tooltip-wrapper">
    <q-icon :name="farQuestionCircle" color="grey" />
    <q-tooltip max-width="250px" self="bottom end" anchor="top end" class="text-body2 tooltip">
      <slot></slot>
    </q-tooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { farQuestionCircle } from '@quasar/extras/fontawesome-v5';

export default defineComponent({
  setup() {
    return {
      farQuestionCircle,
    };
  },
});
</script>

<style lang="scss" scoped>
.tooltip {
  max-width: 150px;
  padding: 10px;
}

.tooltip-wrapper {
  margin: -1px 6px;
}
</style>

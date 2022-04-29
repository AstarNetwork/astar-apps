<template>
  <div class="tooltip-wrapper">
    <q-icon :name="farQuestionCircle" color="tooltip" />
    <q-tooltip
      :delay="200"
      max-width="250px"
      self="bottom middle"
      anchor="top middle"
      class="text-body2 tooltip bg-blue-9"
      transition-show="scale"
      transition-hide="scale"
    >
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
  text-align: justify;
}

.tooltip-wrapper {
  margin: -1px 6px;
}

.bg-tooltip {
  background-color: #165398;
}

.text-tooltip {
  color: #165398;
}
</style>

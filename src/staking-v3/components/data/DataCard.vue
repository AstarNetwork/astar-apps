<template>
  <div class="wrapper--data">
    <div class="card--top">
      {{ title }}
    </div>
    <div class="card--bottom">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { title } from 'process';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--data {
  border: 1px solid $navy-1;
  border-radius: 16px;
  padding: 24px;
  line-height: 1.25;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-height: 150px;
}

.card--top {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: flex-end;
}

.card--bottom {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.body--dark {
  .wrapper--data {
    border-color: $gray-4;
  }
}
</style>

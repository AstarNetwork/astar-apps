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
  min-width: 200px;
}

.card--top {
  font-size: 14px;
  font-weight: 600;
  line-height: normal;
  height: 60px;
  padding-bottom: 8px;
  display: flex;
  align-items: flex-end;
}

.card--bottom {
  font-size: 24px;
  font-weight: 800;
  line-height: normal;
  letter-spacing: -0.48px;
  height: 60px;
  padding-top: 8px;
  display: flex;
  align-items: flex-start;
}
</style>
